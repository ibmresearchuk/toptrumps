angular.module('toptrumps')

.controller('BotInfoCtrl', ['$scope', '$state', 'ttBots', 'ttDecks', function ($scope, $state, ttBots, ttDecks) {

    $scope.loading = true;
    $scope.trainingcount = 0;

    $scope.botname = $state.params.botname;
    if (!$state.params.botname){
        return $state.go('welcome');
    }

    $scope.enemybotname = {
        text : '',
        word : '[A-Za-z0-9]+'
    };


    ttBots.get($scope.botname)
        .then(function (data) {
            $scope.loading = false;

            if (data.trainingcount[ttDecks.DECKNAME]) {
                $scope.trainingcount = data.trainingcount[ttDecks.DECKNAME];
            }
        });

    $scope.newGame = function () {
        $state.go('duel', {
            botname : $scope.botname,
            deckname : ttDecks.DECKNAME
        });
    };

    $scope.newMatch = function () {
        $state.go('duel', {
            botname : $scope.botname,
            enemybotname : $scope.enemybotname.text,
            deckname : ttDecks.DECKNAME
        });
    };
}]);
