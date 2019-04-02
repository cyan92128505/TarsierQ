var app = angular.module('qrApp', ['ngRoute', 'LocalStorageModule']).config([
    '$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(.+):/);
    },
]);

app.config([
    'localStorageServiceProvider',
    function(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('tarsierq');
    },
]);

app.factory('$socket', [
    function() {
        return io(url, {
            transports: ['websocket'],
        });
    },
]);

app.factory('httpRequestInterceptor', [
    '$socket',
    function($socket) {
        return {
            request: function(config) {
                config.headers['socketId'] = $socket.id;
                return config;
            },
        };
    },
]);

app.config([
    '$httpProvider',
    function($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
    },
]);

app.config([
    '$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode(true);
    },
]);

app.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/', { template: '<home-component />' })
            .when('/account', { template: '<account-component />' })
            .when('/scan', { template: '<scan-component />' })
            .when('/pingpong', { template: '<home-component />' })
            .otherwise({
                template: '<h1>404</h1>',
            });
    },
]);
