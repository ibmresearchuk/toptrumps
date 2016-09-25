angular.module('toptrumps').factory('ttDecks', ['$q', '$http', function ($q, $http) {

    /* Gets information about the deck of cards, including the rules to use for it. */
    function get (deckname) {
        return $q(function (resolve, reject) {
            $http({
                method : 'GET',
                url : '/api/decks/' + deckname
            }).then(function (response) {
                resolve(response.data);
            });
        });
    }

    return {
        get: get,

        // when we have more than one deck, we'll stop making this a constant
        DECKNAME : 'kingsandqueens'
    };
}]);
