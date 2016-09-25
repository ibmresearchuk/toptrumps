angular.module('toptrumps')

.factory('ttDecks', ['$q', '$http', function ($q, $http) {

  function get(deckname) {
    return $q(function (resolve, reject) {
      $http({
        method: 'GET',
        url: '/api/decks/' + deckname
      }).then(function (response) {
        resolve(response.data);
      });
    });
  }

  return {
    get: get,

    DECKNAME : 'kingsandqueens'
  };
}]);
