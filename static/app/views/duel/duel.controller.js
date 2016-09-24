angular.module('toptrumps')

.controller('DuelCtrl', ['$scope', 'ttGame', function ($scope, ttGame) {
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
    console.log(decks);
    $scope.decks.player = decks.playerone;
    $scope.decks.computer = decks.playertwo;
  });
}]);