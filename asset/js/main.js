(function() {
    var socket = io(url, {
        transports: ['websocket'],
    });

    function qrCtrlFunc($scope, $http, $q) {
        init();

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
            $scope.loginUrl = null;
            $http.get('/clear?t=' + new Date().valueOf());
        }

        function logout() {
            $scope.loginUrl = null;
            $http.get('/logout?t=' + new Date().valueOf());
        }

        function createClientLogin(client) {
            $scope.clientList.forEach(
                c => (c.active = client.token === c.token)
            );
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
                ? (document.getElementById(
                      qrcodeId
                  ).innerHTML = qr.createImgTag())
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

    var app = angular.module('qrApp', []).config([
        '$compileProvider',
        function($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(
                /^\s*(https?|ftp|mailto|chrome-extension|hades):/
            );
        },
    ]);

    app.controller('qrCtrl', ['$scope', '$http', '$q', qrCtrlFunc]);
})();
