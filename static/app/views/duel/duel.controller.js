angular.module('toptrumps')

.controller('DuelCtrl', ['$scope', '$state', 'ttGame', function ($scope, $state, ttGame) {

    $scope.loading = true;

    $scope.botname = $state.params.botname;
    $scope.deckname = $state.params.deckname;

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

  $scope.selectAttribute = function (key, value) {
    console.log("selected", key, value);
    revealCard();
    calculateResult(key);
  };

  function revealCard () {
    $scope.show.computer = true;
  }

  function calculateResult(key) {
    console.log($scope.decks.player[0].name);
    console.log($scope.decks.player[0][key]);
    console.log($scope.decks.computer[0].name);
    console.log($scope.decks.computer[0][key]);
  }

  ttGame.start('kingsandqueens').then(function(decks) {
    $scope.loading = false;
    $scope.decks.player = decks.playerone;
    $scope.decks.computer = decks.playertwo;
  });
}]);
