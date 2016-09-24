angular.module('toptrumps')

.factory('ttBots', ['$q', '$http', function ($q, $http) {
  function get(botname) {
    return $q(function (resolve, reject) {
      $http({
        method: 'GET',
        url: '/api/bots/' + botname,
        data: {}
      }).then(function (response) {
        resolve(response.data);
      });
    });
  }

  return {
    get : get
  };
}]);
