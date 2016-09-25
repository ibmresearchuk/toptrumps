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

  return {
    get : get,
    learn : learn
  };
}]);
