angular.module('toptrumps')

.directive('ttCard', [function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'app/directives/card/card.html',
    scope: {
      cardData : '=',
      revealed : '=',
      onSelectAttribute : '&'
    }
  };
}]);