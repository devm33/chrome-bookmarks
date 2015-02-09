angular.module('focus-check', [])

.directive('focusCheck', function() {
    return {
        restrict: 'E',
        scope: {},
        controllerAs: 'ctrl',
        controller: 'FocusCheckCtrl',
    };
})

.controller('FocusCheckCtrl', function($window, $element, $scope) {
    var ctrl = this;
    var msg = 'press tab or click to focus on page';
    var windowEl = angular.element($window);
    $element.html(msg);
    windowEl.on('focus', function() {
        $element.html('click or press key to select a bookmark');
    });
    windowEl.on('blur', function() {
        $element.html(msg);
    });
    $scope.$on('$destroy', function() {
        windowEl.off();
    });
});

