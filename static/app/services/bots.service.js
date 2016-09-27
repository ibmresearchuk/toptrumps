angular.module('toptrumps').factory('ttBots', ['$q', '$http', function ($q, $http) {

    /* Gets information about a bot - such as how much training it's had. */
    function get (botname) {
        return $q(function (resolve, reject) {
            $http({
                method : 'GET',
                url : '/api/bots/' + botname
            }).then(function (response) {
                resolve(response.data);
            });
        });
    }

    /* Adds to the training data for a bot. */
    function learn (deckname, botname, trainingdata) {
        return $q(function (resolve, reject) {
            $http({
                method : 'PATCH',
                url : '/api/bots/' + botname + '/training',
                data : [
                    {
                        op : 'add',
                        deck : deckname,
                        value : trainingdata
                    }
                ]
            }).then(function (response) {
                resolve(response.data);
            });
        });
    }

    /* Trains a new ML model based on stored training data. */
    function train (deckname, botname) {
        return $q(function (resolve, reject) {
            $http({
                method : 'PUT',
                url : '/api/bots/' + botname + '?deckname=' + deckname,
                data : {}
            }).then(function (response) {
                resolve(response.data);
            });
        });
    }

    /* Makes a prediction using the ML model. */
    function predict (deckname, botname, card) {
        card.deckname = deckname;
        return $q(function (resolve, reject) {
            $http({
                method : 'GET',
                url : '/api/bots/' + botname,
                params : card
            }).then(function (response) {
                resolve(response.data);
            });
        });
    }


    /* Returns a promise that resolves in two seconds. */
    function wait () {
        var deferred = $q.defer();
        setTimeout(deferred.resolve, 2000);
        return deferred.promise;
    }

    /* Calls predict() but won't return for at least 2 seconds. */
    function slowPredict(deckname, botname, card) {
        return $q.all([wait(), predict(deckname, botname, card)])
            .then(function (data) {
                return data[1];
            });
    }

    return {
        get : get,
        learn : learn,
        train : train,
        predict : predict,

        slowPredict : slowPredict
    };
}]);
