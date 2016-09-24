angular.module('toptrumps', [
  'ui.router'
])

.config(function ($urlRouterProvider, $stateProvider, $locationProvider) {

  $locationProvider.html5Mode({
    enabled: true
  });

  $urlRouterProvider
  .otherwise('/duel');

  $stateProvider
  .state('duel', {
    url: '/duel',
    templateUrl: 'app/views/duel/duel.html',
    controller: 'DuelCtrl'
  });
});