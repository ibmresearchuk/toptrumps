angular.module('toptrumps').controller('DuelCtrl', ['$scope', '$state', '$q', 'ngDialog', 'ttGame', 'ttDecks', 'ttBots', function ($scope, $state, $q, ngDialog, ttGame, ttDecks, ttBots) {

    /* true when we're getting data we need to set up */
    $scope.loading = true;

    /* true while submitting training data, so the player doesn't move on to the next card until this finishes */
    $scope.learning = false;

    /* lets the dialog controllers call dialog functions */
    $scope.ngDialog = ngDialog;

    /* this should be 'player' or 'computer' depending on whose turn it is next */
    $scope.nextturn = 'player';

    /* matches the values used by the API */
    var WIN = 1;
    var DRAW = 0;
    var LOSE = -1;


    /* required info about the game */
    $scope.botname = $state.params.botname;
    $scope.deckname = $state.params.deckname;
    if (!$state.params.botname || !$state.params.deckname){
        return $state.go('welcome');
    }


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


    /* What should happen after a turn is complete.
        Basically, we start the training of a new ML
        model, and decide whose turn it should be next.
        If it's the computer's turn, we introduce a
        short delay before kicking that off to make
        the game feel more natural. */
    function afterTurn () {
        ttBots.train($scope.deckname, $scope.botname);

        if ($scope.outcome === WIN) {
            $scope.nextturn = 'player';
        }
        else if ($scope.outcome === LOSE) {
            $scope.nextturn = 'computer';
        }
        // else if DRAW the nextturn stays the same

        if ($scope.nextturn === 'computer') {
            setTimeout(computerTurn, 600);
        }
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


    /* Makes a move for the computer using the ML model
        for this bot. It opens a dialog to display the
        computer's move and the outcome. */
    function computerTurn () {
        // displays a placeholder message while getting the prediction
        $scope.thinking = true;

        // deletes any previous prediction
        delete $scope.prediction;

        // opens the dialog to handle the computer's turn
        ngDialog.open({
            template : 'app/views/duel/computerturn.html',
            scope : $scope,
            showClose : false,
            closeByEscape : false
        }).closePromise.then(afterTurn);

        // in parallel, start getting the computer's move that
        //   will populate the dialog once it returns
        ttBots.slowPredict($scope.deckname, $scope.botname, getCardAttrs($scope.decks.computer[0]))
            .then(function (data) {
                // reveal the computer's card
                $scope.show.computer = true;

                // get the computer's choice ready to display
                $scope.prediction = data;
                $scope.selection = data.choice;

                // decide if the computer won
                $scope.outcome = calculateResult(data.choice);

                // display it in the dialog
                $scope.thinking = false;
                $scope.learning = false;
        });
    }


    /* Handles a player's move - invoked when they click on one of
        the attributes on their card. */
    $scope.selectAttribute = function (key, value) {
        // ignore if it's not their turn!
        if ($scope.nextturn === 'player') {

            // reveal the computer's card
            $scope.show.computer = true;

            // decide if the player won
            $scope.selection = key;
            $scope.outcome = calculateResult(key);

            // display it in a dialog
            $scope.learning = false;
            ngDialog.open({
                template : 'app/views/duel/playerturn.html',
                scope : $scope,
                showClose : false,
                closeByEscape : false
            }).closePromise.then(afterTurn);
        }
    };



    /* Moves on to the next card. Called when the user clicks on the
        next-card button. It takes the cards of the top of the two
        decks and moves them to the back of the deck for whoever
        won the last hand.
       It submits the outcome of the last hand to the API to be
        added to the training data for the bot.
       Once this is all finished, it closes any open dialogs from the
        last move.  */
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

        ttBots.learn($scope.deckname, $scope.botname, training)
            .then(function () {
                ngDialog.close();
            });
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

            $scope.decks.player = data[1].playerone;
            $scope.decks.computer = data[1].playertwo;

            $scope.loading = false;
        });

}]);
