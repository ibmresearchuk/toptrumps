angular.module('toptrumps')

.factory('ttDecks', [function () {

  function get(deck) {
    $http({
      method : 'GET',
      url : '/api/decks/' + deck
    }).then(function(response) {
      console.log(response);
    });
  }

  return {
    get: get,

    DECKNAME : 'kingsandqueens'
  };
}]);
