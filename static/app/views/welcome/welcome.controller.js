angular.module('toptrumps').controller('WelcomeCtrl', ['$scope', '$state', 'ttGame', function ($scope, $state, ttGame) {

    $scope.botname = {
        text : '',
        word : '[A-Za-z0-9]+'
    };

    $scope.startBot = function () {
        $state.go('botinfo', { botname : $scope.botname.text });
    };
}]);
