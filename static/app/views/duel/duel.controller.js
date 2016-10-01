angular.module('toptrumps').controller('DuelCtrl', ['$scope', '$state', '$q', 'ngDialog', 'ttGame', 'ttDecks', 'ttBots', function ($scope, $state, $q, ngDialog, ttGame, ttDecks, ttBots) {

    /* true when we're getting data we need to set up */
    $scope.loading = true;

    /* true while waiting for the current player's turn */
    $scope.thinking = true;

    /* true while submitting training data, so the player doesn't move on to the next card until this finishes */
    $scope.learning = false;

    /* this should be 'player' or 'computer' depending on whose turn it is next */
    $scope.nextturn = 'player';

    /* current win streak the computer player has had so far in this game */
    $scope.winstreak = 0;
    /* best win streak the computer player has had so far in this game */
    $scope.beststreak = 0;

    /* how many hands of the game has this bot got in it's training data so far? */
    $scope.computertraining = 0;

    /* matches the values used by the API */
    var WIN = 1;
    var DRAW = 0;
    var LOSE = -1;


    /* required info about the game */
    $scope.botname = $state.params.botname;
    $scope.deckname = $state.params.deckname;
    $scope.enemybotname = $state.params.enemybotname;
    if (!$state.params.botname || !$state.params.deckname){
        return $state.go('welcome');
    }

    /* does the user have to click between every move? */
    $scope.autodraw = $scope.enemybotname ? true : false;

    /* the pile of cards for each player */
    $scope.decks = {
        player : [],
        computer : []
    };

    /* true if we should show the card face, false if we should show the back of the card. */
    $scope.show = {
        player : true,
        computer : false
    };


    /* messages to cycle around in the UI */
    $scope.didyouknow = [
        'The player which wins the turn gets to choose attribute for the next turn.',
        $scope.botname + ' learns from every turn of the game. With each new card, it should get a little better at knowing which attribute to choose.',
        'The information that ' + $scope.botname + ' uses to learn from are the attributes from it\'s card, the choice that was made (whether the choice was made by ' + $scope.botname + ' or you), and whether or not it won.',
        'When it is ' + $scope.botname + '\'s turn, the only information it uses to choose are the numbers on it\'s own card. It isn\'t peeking at your card. Honest!',
        'People have trained machine learning systems to play lots of games before. With about a day\'s training, you can train a ML system to play Super Mario.',
        'You are only training ' + $scope.botname + '. This means that if you want to go back to playing against a bot that doesn\'t know how to play, just start again with a new bot name.',
        'The more examples that ' + $scope.botname + ' has to learn from, the better it can get.',
        'The type of machine learning that is being used to train ' + $scope.botname + ' is called a decision tree.',
        'Winning or losing a turn are both useful to train ' + $scope.botname + '. Losing isn\'t a bad thing, as it helps train the bot what it should avoid doing.',
        'If you want to help a new bot to learn quickly, try to give it an example of what happens for every attribute choice. If there is any attribute that it has never seen chosen in it\'s training, it wont know when it is good to choose it.'
    ];



    /* Helper function to get the card attributes as a
        single object of key/value pairs. This excludes
        the name and picture, and keeps only the ones
        that are used in playing the game. */
    function getCardAttrs (card) {
        var values = {};
        var attrs = Object.keys($scope.rules);
        for (var i = 0; i < attrs.length; i++) {
            values[attrs[i]] = card[attrs[i]];
        }
        return values;
    }


    /* Helper function to decide which player wins a hand.
        Bigger isn't always better, so this uses the rules
        for the deck to decide which player wins. */
    function calculateResult(key) {
        if ($scope.rules[key] === 'higher') {
            if ($scope.decks.player[0][key] > $scope.decks.computer[0][key]) {
                return WIN;
            }
            else if ($scope.decks.player[0][key] < $scope.decks.computer[0][key]) {
                return LOSE;
            }
            else if ($scope.decks.player[0][key] === $scope.decks.computer[0][key]) {
                return DRAW;
            }
        }
        else if ($scope.rules[key] === 'lower') {
            if ($scope.decks.player[0][key] < $scope.decks.computer[0][key]) {
                return WIN;
            }
            else if ($scope.decks.player[0][key] > $scope.decks.computer[0][key]) {
                return LOSE;
            }
            else if ($scope.decks.player[0][key] === $scope.decks.computer[0][key]) {
                return DRAW;
            }
        }
    }



    function handleGameOver () {
        // hacky workaround to disable buttons to stop the game
        $scope.learning = true;

        // store the winner's name so we can display it
        $scope.winner = '';
        if ($scope.decks.computer.length === 0) {
            $scope.winner = $scope.enemybotname ? $scope.enemybotname : 'You';
        }
        else {
            $scope.winner = $scope.botname;
        }

        return ngDialog.open({
            template : 'app/views/duel/gameover.html',
            showClose : false,
            closeByEscape : false,
            scope : $scope
        });
    }


    function waitForPlayerMove () {
        $scope.thinking = true;

        if ($scope.enemybotname) {
            ttBots.slowPredict($scope.deckname, $scope.enemybotname, getCardAttrs($scope.decks.player[0]))
                .then(function (data) {
                    // decide if the computer won
                    handleMove(data.choice);

                    // automatically move on to the next card
                    setTimeout($scope.drawCard, 600);
                });
        }
    }


    function handleMove (key) {
        // reveal the computer's card
        $scope.show.computer = true;

        // work out who won
        $scope.selection = key;
        $scope.outcome = calculateResult(key);

        // display the results
        $scope.thinking = false;
    }


    /* Handles a player's move - invoked when they click on one of
        the attributes on their card. */
    $scope.userMove = function (key) {

        // ignore if it's not their turn!
        if ($scope.nextturn === 'player' && $scope.thinking) {

            // decide if the player won
            handleMove(key);

            // wait for the next-card button to be clicked
        }
    };



    /* Makes a move for the computer using the ML model
        for this bot. It opens a dialog to display the
        computer's move and the outcome. */
    function computerMove () {
        // displays a placeholder message while getting the prediction
        $scope.thinking = true;

        ttBots.slowPredict($scope.deckname, $scope.botname, getCardAttrs($scope.decks.computer[0]))
            .then(function (data) {
                // decide if the computer won
                handleMove(data.choice);

                // keep track of computer's performance
                if ($scope.outcome === LOSE) {
                    // if the player lost, this means the computer won
                    //  so we increment it's streak counter
                    $scope.winstreak += 1;

                    // if this is our best ever score, increment it too
                    if ($scope.winstreak > $scope.beststreak) {
                        $scope.beststreak = $scope.winstreak;
                    }
                }
                else if ($scope.outcome === WIN) {
                    // if the player won, this means the computer made
                    //  the wrong choice. so it's streak counter gets reset
                    $scope.winstreak = 0;
                }


                if ($scope.autodraw) {
                    // automatically move on to the next card
                    setTimeout($scope.drawCard, 600);
                }
                else {
                    // wait for the next-card button to be clicked
                }
        });
    }


    /* Adds these cards to the training data and then builds a new
        ML model using the updated training data */
    function learnFromTurn (playercard, computercard) {
        var training = [
            // learning from the player's hand
            {
                card : getCardAttrs(playercard),
                choice : $scope.selection,
                outcome : $scope.outcome
            },
            // learning from the computer's hand
            {
                card : getCardAttrs(computercard),
                choice : $scope.selection,
                // if the player won, the computer lost
                //   and vice versa.
                // if the player drew, then leave the outcome as-is
                outcome : $scope.outcome === 0 ? 0 : -($scope.outcome)
            }
        ];

        return ttBots.learn($scope.deckname, $scope.botname, training)
            .then(function () {
                return ttBots.train($scope.deckname, $scope.botname);
            })
            .then(function (data) {
                if (data.status === 'complete') {
                    // we submit two rows of training data for each
                    //  turn of the game (one representing the player's
                    //  card and outcome, the other representing the
                    //  computer's card and their outcome)
                    $scope.computertraining = data.hands / 2;
                }
            });
    }


    /* Moves on to the next card. Called when the user clicks on the
        next-card button. It takes the cards of the top of the two
        decks and moves them to the back of the deck for whoever
        won the last hand.
       It submits the outcome of the last hand to the API to be
        added to the training data for the bot.
       Once this is all finished, it starts the next move  */
    $scope.drawCard = function () {
        // disable the next-card button so the user can't click
        //  multiple times and submit duplicate training data
        $scope.learning = true;

        // hide the computer's card first before changing it
        //  so we don't give it away
        $scope.show.computer = false;

        // take the cards off the top of the decks
        var playercard = $scope.decks.player.shift();
        var computercard = $scope.decks.computer.shift();

        // put them to the back of the appropriate decks
        if ($scope.outcome === WIN) {
            $scope.decks.player.push(playercard);
            $scope.decks.player.push(computercard);
        }
        else if ($scope.outcome === LOSE) {
            $scope.decks.computer.push(playercard);
            $scope.decks.computer.push(computercard);
        }
        else {
            $scope.decks.player.push(playercard);
            $scope.decks.computer.push(computercard);
        }

        // add these cards to the training data and train a new ML model
        learnFromTurn(playercard, computercard)
            .then(function () {
                $scope.learning = false;

                // has the game finished?
                //  are there any more cards to draw?
                if ($scope.decks.player.length === 0 ||
                    $scope.decks.computer.length === 0)
                {
                    return handleGameOver();
                }


                if ($scope.outcome === WIN) {
                    $scope.nextturn = 'player';
                }
                else if ($scope.outcome === LOSE) {
                    $scope.nextturn = 'computer';
                }
                // else if DRAW the nextturn stays the same

                // reset the result for this turn
                $scope.outcome = undefined;

                if ($scope.nextturn === 'player') {
                    waitForPlayerMove();
                }
                else if ($scope.nextturn === 'computer') {
                    computerMove();
                }
            })

    };








    //----------------------------------------------
    //   START THE GAME!
    //----------------------------------------------

    // get the rules for the deck, needed to know who wins each hand
    var decksPromise = ttDecks.get($scope.deckname);
    // gets the shuffled, dealt deck
    var gamePromise = ttGame.start($scope.deckname);

    // wait until both of these are ready before starting
    $q.all([ decksPromise, gamePromise ])
        .then(function (data) {
            $scope.rules = data[0].rules;
            $scope.explanations = data[0].explanations;

            $scope.decks.player = data[1].playerone;
            $scope.decks.computer = data[1].playertwo;

            $scope.loading = false;

            // wait for the first player to make their move
            waitForPlayerMove();
        });

}]);
