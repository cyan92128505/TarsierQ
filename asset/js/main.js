var socket = io(url, {
    transports: ['websocket'],
});

function qrCtrlFunc($scope, $http, $q) {
    $scope.pageState = 'home';
    //init();

    function init() {
        $scope.loginUrl = '';
        $scope.clientList = [];
        $scope.createClientLogin = createClientLogin;
        $scope.logout = logout;
        $scope.clear = clear;

        createQrcodeImage('generator', url, socket.id);

        getClientList($scope, $http).then(function() {
            if ($scope.clientList.length == 0) {
                return;
            }
            $scope.clientList[0].active = true;
            createClientLogin($scope.clientList[0]);
        });

        setupWebSocket();
    }

    function getClientList($scope, $http) {
        return $http.get('/client').then(function(result) {
            $scope.clientList = result.data.clientList;
        });
    }

    function clear() {
        $http.get('/clear?t=' + new Date().valueOf());
    }

    function logout() {
        $http.get('/logout?t=' + new Date().valueOf());
    }

    function createClientLogin(client) {
        $scope.clientList.forEach(c => (c.active = client.token === c.token));
        $scope.loginUrl = prepareUrl(url, 'login', '');

        createQrcodeImage('login', url, '');
    }

    function setupWebSocket() {
        socket.on('sendMessage', function(data) {
            $scope.generatorUrl = prepareUrl(url, 'generator', socket.id);
            getClientList($scope, $http);
        });

        socket.on('newClient', function(data) {
            createClientLogin(data);
            getClientList($scope, $http);
        });

        socket.on('refresh', function() {
            getClientList($scope, $http);
        });
    }

    function createQrcodeImage(qrcodeId, url, hash) {
        var typeNumber = 8;
        var errorCorrectionLevel = 'L';
        var qr = qrcode(typeNumber, errorCorrectionLevel);
        // var qrvalue =
        //     '{"url":"' +
        //     url +
        //     '","api":"' +
        //     qrcodeId +
        //     '","hash":"' +
        //     hash +
        //     '"}';
        var qrvalue = prepareUrl(url, qrcodeId, hash);
        console.log(qrvalue);
        qr.addData(qrvalue);
        qr.make();
        document.getElementById(qrcodeId)
            ? (document.getElementById(qrcodeId).innerHTML = qr.createImgTag())
            : '';
    }

    function prepareUrl(url, api, hash) {
        return [
            'hades://api?',
            'url=',
            url,
            '&',
            'api=',
            api,
            '&',
            'hash=',
            hash,
        ].join('');
    }
}

var app = angular.module('qrApp', ['ngRoute']).config([
    '$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(
            /^\s*(https?|ftp|mailto|chrome-extension|hades):/
        );
    },
]);

app.factory('httpRequestInterceptor', function() {
    return {
        request: function(config) {
            config.headers['socketId'] = socket.id;

            return config;
        },
    };
});

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
            .otherwise({
                template: '<h1>404</h1>',
            });
    },
]);
