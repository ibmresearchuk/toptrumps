angular.module('toptrumps', [
  'ui.router'
])

.config(function ($urlRouterProvider, $stateProvider, $locationProvider) {

  $locationProvider.html5Mode({
      enabled: true
  });

  $urlRouterProvider
    .otherwise('/welcome');

  $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'app/views/welcome/welcome.html',
      controller: 'WelcomeCtrl'
    })
    .state('botinfo', {
      url: '/botinfo?botname',
      templateUrl: 'app/views/botinfo/botinfo.html',
      controller: 'BotInfoCtrl',
      params : {
        botname : ''
      }
    })
    .state('duel', {
      url: '/duel',
      templateUrl: 'app/views/duel/duel.html',
      controller: 'DuelCtrl',
      params : {
        botname : '',
        deckname : ''
      }
    });
});
