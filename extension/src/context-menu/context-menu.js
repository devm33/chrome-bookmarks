angular.module('context-menu', [])

.directive('contextMenu', function() {
    return {
        restrict: 'E',
        scope: {},
        transclude: true,
        template: '<div ng-transclude></div>',
        controller: function($scope, $element, $window, $rootScope, $window) {
            function open(event) {
                $rootScope.$emit('contextmenu');
                event.preventDefault();
                $element.addClass('show');
                $element.css({
                    top: Math.min(event.clientY, getMaxYPos()) + 'px',
                    left: event.clientX + 'px',
                });
            }
            function close() {
                $element.removeClass('show');
            }
            $element.parent().on('contextmenu', open);
            angular.element($window).on('click', close);
            $rootScope.$on('contextmenu', close);

            $scope.$on('$destroy', function() {
                $element.parent().off('contextmenu', open);
                angular.element($window).off('click', close);
            });

            function getMaxYPos() {
                return $window.innerHeight - $element[0].offsetHeight;
            }
        }
    };
})

.directive('contextMenuItem', function() {
    return {
        restrict: 'E',
        require: '^contextMenu',
        scope: { handler: '&' },
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function(scope, element, attrs, parentCtrl) {
            element.on('click', function(event) {
                scope.handler();
                event.preventDefault();
            });
        }
    };
});
