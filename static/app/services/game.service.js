angular.module('toptrumps')

.factory('ttGame', ['$q', '$http', function ($q, $http) {
  function start(deck) {
    return $q(function (resolve, reject) {
      $http({
        method: 'POST',
        url: '/api/games?deckname=' + deck,
        data: {}
      }).then(function (response) {
        resolve(response.data);
      });
    });
  }

  return {
    start: start
  };
}]);
