angular.module('bookmarks', [
    'focus-check',
    'context-menu',
])

.constant('LEADER_KEY_CODE', 32) // space bar as leader

.config(function($compileProvider) {
    // need to access chrome://favicon/ for favicon images
    // and access to chrome-extension://* for local images
    $compileProvider
    .imgSrcSanitizationWhitelist(/^\s*(https?|ftp|chrome|chrome-extension):/);
})

.factory('KeyIndex', function() {
    return function(index) {
        return String.fromCharCode(47 + index);
    };
})

.directive('bookmark', function() {
    return {
        scope: { bookmark: '=', index: '=' },
        templateUrl: 'src/bookmarks/bookmark.html',
        controller: 'BookmarkCtrl',
        controllerAs: 'ctrl',
    };
})

.controller('BookmarkCtrl', function($scope, $element, KeyIndex, $injector) {
    var bookmark = $scope.bookmark;
    if(bookmark.url) {
        this.model = new ($injector.get('Link'))(bookmark);
        $element.attr('href', bookmark.url);
    } else {
        if(angular.isString(bookmark.model) && $injector.has(bookmark.model)) {
            this.model = new ($injector.get(bookmark.model))(bookmark);
        } else {
            this.model = new ($injector.get('Dir'))(bookmark);
        }
        $element.on('click', this.model.click.bind(this.model));
        $scope.$on('$destroy', function() { $element.off(); });
    }
    this.index = KeyIndex($scope.index);
    $scope.$on('key:' + this.index, this.model.click.bind(this.model));
})

.factory('Bookmark', function(Bookmarks) {
    function Bookmark() {} // 'abstract' super, no constructor
    Bookmark.prototype.delete = function() {
        if(confirm('Are you sure you want to delete ' + (
            this.bookmark.title || this.bookmark.url) + '?')) {

            Bookmarks.remove(this.bookmark.id);
            Bookmarks.currentList.splice(
                Bookmarks.currentList.indexOf(this.bookmark), 1
            );
        }
    };
    Bookmark.prototype.edit = function() {
        console.log('TODO implement edit');
    };
    return Bookmark;
})

.factory('Link', function(Bookmark, $window) {
    function Link(bookmark) { // must have bookmark.url
        this.bookmark = bookmark;
        this.iconUrl = 'chrome://favicon/' + bookmark.url;
    }
    Link.prototype = new Bookmark();
    Link.prototype.click = function() {
        $window.location = this.bookmark.url;
    };
    return Link;
})

.factory('Dir', function(Bookmark, $rootScope, OpenBookmarksInTabs) {
    function Dir(bookmark) {
        this.bookmark = bookmark;
        this.iconUrl = 'img/dir-icon.png';
    }
    Dir.prototype = new Bookmark();
    Dir.prototype.click = function(event, keyEvent) {
        if(event.which === 2 || // open all in tabs on middle click
           (keyEvent && keyEvent.leader)) { // or with leader key press
            OpenBookmarksInTabs(this.bookmark.id);
        } else {
            $rootScope.$broadcast('bookmarks', this.bookmark.id);
        }
    };
    return Dir;
})

.factory('UpOneLevel', function(Bookmarks, $rootScope) {
    function UpOneLevel(bookmark) {
        this.iconUrl = 'img/up-one-level-icon.png';
        this.bookmark = { title: 'up one' };
        this.currentId = bookmark.currentId;
    }
    UpOneLevel.prototype.click = function() {
        Bookmarks.get(this.currentId).then(function(current) {
            $rootScope.$broadcast('bookmarks', current.parentId);
        });
    };
    return UpOneLevel;
})

.factory('OpenAll', function(OpenBookmarksInTabs) {
    function OpenAll(bookmark) {
        this.iconUrl = 'img/open-all-icon.png';
        this.bookmark = { title: 'open all' };
        this.bookmarks = bookmark.bookmarks;
    }
    OpenAll.prototype.click = function() {
        OpenBookmarksInTabs(this.bookmarks);
    };
    return OpenAll;
})

.directive('bookmarks', function() {
    return {
        restrict: 'E',
        scope: { id: '=' },
        templateUrl: 'src/bookmarks/bookmarks.html',
        controller: 'BookmarksCtrl',
        controllerAs: 'ctrl',
    };
})

.controller('BookmarksCtrl', function(Bookmarks, $scope, $window, LEADER_KEY_CODE) {
    var ctrl = this;
    function load(id) {
        ctrl.id = id;
        Bookmarks.getChildren(id).then(function(bookmarks) {
            ctrl.bookmarks = [];
            if(id !== '0') {
                ctrl.bookmarks.push({ model: 'UpOneLevel', currentId: id });
            }
            if(hasLink(bookmarks)) {
                ctrl.bookmarks.push({ model: 'OpenAll', bookmarks: bookmarks });
            }
            ctrl.bookmarks = ctrl.bookmarks.concat(bookmarks);
            Bookmarks.currentList = ctrl.bookmarks;
        });
    }
    load($scope.id);
    $scope.$on('bookmarks', function(event, id) { load(id); });
    var leaderPressedPrev;
    function key(event) {
        if(event.keyCode === LEADER_KEY_CODE) {
            leaderPressedPrev = true;
        } else {
            if(leaderPressedPrev) {
                leaderPressedPrev = false;
                event.leader = true;
            }
            $scope.$broadcast('key:'+String.fromCharCode(event.charCode), event);
        }
    }
    angular.element($window).on('keypress', key);
    $scope.$on('$destroy', function() {
        angular.element($window).off('keypress', key);
    });
    function hasLink(bookmarks) {
        for(var i = 0; i < bookmarks.length; i++) {
            if(bookmarks[i].url) {
                return true;
            }
        }
        return false;
    }
})

.service('Bookmarks', function($q) {
    this.getChildren = function(id) {
        var deferred = $q.defer();
        chrome.bookmarks.getChildren(id, function(children) {
            deferred.resolve(children);
        });
        return deferred.promise;
    };
    this.get = function(id) {
        var deferred = $q.defer();
        chrome.bookmarks.get(id, function(bookmark) {
            deferred.resolve(bookmark[0]);
        });
        return deferred.promise;
    };
    this.remove = function(id) {
        chrome.bookmarks.remove(id);
    };
})

.factory('OpenBookmarksInTabs', function(Tabs, Bookmarks) {
    function openAll(idOrArray) {
        if(angular.isArray(idOrArray)) {
            Tabs.closeCurrent();
            angular.forEach(idOrArray, function(bookmark) {
                if(bookmark.url) {
                    Tabs.create({ url: bookmark.url });
                }
            });
        } else {
            Bookmarks.getChildren(idOrArray).then(openAll);
        }
    }
    return openAll;
})

.service('Tabs', function($q) {
    this.closeCurrent = function() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id);
        });
    };
    this.create = function(options) {
        chrome.tabs.create(options);
    };
});
