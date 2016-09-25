angular.module('toptrumps')

.factory('ttBots', ['$q', '$http', function ($q, $http) {
  function get(botname) {
    return $q(function (resolve, reject) {
      $http({
        method: 'GET',
        url: '/api/bots/' + botname
      }).then(function (response) {
        resolve(response.data);
      });
    });
  }

  function learn(deckname, botname, trainingdata) {
    return $q(function (resolve, reject) {
      $http({
        method: 'PATCH',
        url: '/api/bots/' + botname + '/training',
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

  function train(deckname, botname) {
    return $q(function (resolve, reject) {
      $http({
        method: 'PUT',
        url: '/api/bots/' + botname + '?deckname=' + deckname,
        data : {}
      }).then(function (response) {
        resolve(response.data);
      });
    });
  }

  function wait () {
    var deferred = $q.defer();
    setTimeout(deferred.resolve, 1000);
    return deferred.promise;
  }

  function predict(deckname, botname, card) {
    card.deckname = deckname;
    return $q(
      function (resolve, reject) {
      $http({
        method: 'GET',
        url: '/api/bots/' + botname,
        params : card
      }).then(function (response) {
        resolve(response.data);
      });
    });
  }

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
