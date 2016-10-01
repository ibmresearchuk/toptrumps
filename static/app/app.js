angular.module('toptrumps', ['ui.router', 'ngDialog', 'ui.checkbox'])
    .config(function ($urlRouterProvider, $stateProvider, $locationProvider) {

      $locationProvider.html5Mode({
          enabled: false
      });

      $urlRouterProvider.otherwise('/welcome');

      $stateProvider
          .state('welcome', {
              url : '/welcome',
              templateUrl : 'app/views/welcome/welcome.html',
              controller : 'WelcomeCtrl'
          })
          .state('botinfo', {
              url : '/botinfo?botname',
              templateUrl : 'app/views/botinfo/botinfo.html',
              controller : 'BotInfoCtrl',
              params : {
                  botname : ''
              }
          })
          .state('duel', {
              url : '/duel',
              templateUrl : 'app/views/duel/duel.html',
              controller: 'DuelCtrl',
              params : {
                  botname : '',
                  deckname : '',
                  enemybotname : ''
              }
          })
          .state('about', {
              url : '/about',
              templateUrl : 'app/views/about/about.html'
          });
});
