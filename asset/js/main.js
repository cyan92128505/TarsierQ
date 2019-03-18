(function() {
    function qrCtrlFunc($scope, $http, $q) {
        var socket = io(url, {
            transports: ['websocket'],
        });

        $scope.loginUrl = '';
        $scope.clientList = [];

        socket.on('sendMessage', function(data) {
            console.log(socket.id);
            console.log(data);

            $scope.generatorUrl =
                'hades://api?url=' + url + '/generator&hash=' + socket.id;

            getClientList($scope, $http);
        });

        socket.on('newClient', function(data) {
            console.log(socket.id);
            console.log(data);

            createClientLogin(data);

            getClientList($scope, $http);
        });

        socket.on('refresh', function() {
            getClientList($scope, $http);
        });

        createQrcodeImage('generator', url + '/generator', socket.id);

        getClientList($scope, $http).then(function() {
            if ($scope.clientList.length == 0) {
                return;
            }
            $scope.clientList[0].active = true;
            createClientLogin($scope.clientList[0]);
        });

        function createClientLogin(client) {
            $scope.clientList.forEach(
                c => (c.active = client.token === c.token)
            );
            $scope.loginUrl = 'hades://api?url="' + url + '/login"' + '&hash=';

            createQrcodeImage('login', url + '/login', '');
        }

        $scope.createClientLogin = createClientLogin;

        $scope.logout = function() {
            $scope.loginUrl = null;
            $http.get('/logout?t=' + new Date().valueOf());
        };

        $scope.clear = function() {
            $scope.loginUrl = null;
            $http.get('/clear?t=' + new Date().valueOf());
        };
    }

    function getClientList($scope, $http) {
        return $http.get('/client').then(function(result) {
            $scope.clientList = result.data.clientList;
        });
    }

    function createQrcodeImage(qrcodeId, url, hash) {
        var typeNumber = 8;
        var errorCorrectionLevel = 'L';
        var qr = qrcode(typeNumber, errorCorrectionLevel);
        var qrvalue = '{"url":"' + url + '","hash":"' + hash + '"}';
        console.log(qrvalue);
        qr.addData(qrvalue);
        qr.make();
        document.getElementById(qrcodeId)
            ? (document.getElementById(qrcodeId).innerHTML = qr.createImgTag())
            : '';
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
