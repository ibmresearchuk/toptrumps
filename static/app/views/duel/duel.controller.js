angular.module('toptrumps')

.controller('DuelCtrl', ['$scope', '$state', '$q', 'ngDialog', 'ttGame', 'ttDecks', 'ttBots', function ($scope, $state, $q, ngDialog, ttGame, ttDecks, ttBots) {

    $scope.loading = true;
    $scope.learning = false;

    $scope.ngDialog = ngDialog;

    $scope.botname = $state.params.botname;
    $scope.deckname = $state.params.deckname;

    $scope.nextturn = 'player';

    var WIN = 1;
    var DRAW = 0;
    var LOSE = -1;

    if (!$state.params.botname || !$state.params.deckname){
        return $state.go('welcome');
    }



  $scope.decks = {
    player : [],
    computer : []
  };

  $scope.show = {
    player : true,
    computer : false
  };

  function computerTurn () {
    $scope.thinking = true;
    delete $scope.prediction;
    ngDialog.open({
      template : 'app/views/duel/computerturn.html',
      scope : $scope,
      showClose : false,
      closeByEscape : false
    }).closePromise.then(afterTurn);


    ttBots.slowPredict($scope.deckname, $scope.botname, getCardAttrs($scope.decks.computer[0]))
      .then(function (data) {
          revealCard();
          $scope.prediction = data;
          $scope.outcome = calculateResult(data.choice);
          $scope.thinking = false;
          $scope.learning = false;
      });
  }

  function afterTurn () {
    ttBots.train($scope.deckname, $scope.botname);

    if ($scope.outcome === WIN) {
      $scope.nextturn = 'player';
    }
    else if ($scope.outcome === LOSE) {
      $scope.nextturn = 'computer';
    }

    if ($scope.nextturn === 'computer') {
      setTimeout(computerTurn, 600);
    }
  }

  $scope.selectAttribute = function (key, value) {
    if ($scope.nextturn === 'player') {

        revealCard();
        $scope.selection = key;
        $scope.outcome = calculateResult(key);

        $scope.learning = false;
        ngDialog.open({
          template : 'app/views/duel/playerturn.html',
          scope : $scope,
          showClose : false,
          closeByEscape : false
        }).closePromise.then(afterTurn);
    }
  };

  function revealCard () {
    $scope.show.computer = true;
  }

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
      else {
        console.log('ERROR');
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
      else {
        console.log('ERROR');
      }
    }
    else {
      console.log('ERROR');
    }
  }


  function getCardAttrs (card) {
    var values = {};
    var attrs = Object.keys($scope.rules);
    for (var i = 0; i < attrs.length; i++) {
      values[attrs[i]] = card[attrs[i]];
    }
    return values;
  }


  $scope.drawCard = function () {
    $scope.learning = true;

    $scope.show.computer = false;

    var playercard = $scope.decks.player.shift();
    var computercard = $scope.decks.computer.shift();

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
      {
        card : getCardAttrs(playercard),
        choice : $scope.selection,
        outcome : $scope.outcome
      },
      {
        card : getCardAttrs(computercard),
        choice : $scope.selection,
        outcome : $scope.outcome === 0 ? 0 : -($scope.outcome)
      }
    ];

    ttBots.learn($scope.deckname, $scope.botname, training)
      .then(function () {
          ngDialog.close();
      });
  };





  var decksPromise = ttDecks.get($scope.deckname);
  var gamePromise = ttGame.start($scope.deckname);

  $q.all([ decksPromise, gamePromise ])
    .then(function (data) {
      $scope.rules = data[0].rules;
      $scope.decks.player = data[1].playerone;
      $scope.decks.computer = data[1].playertwo;
      $scope.loading = false;
    });

}]);
