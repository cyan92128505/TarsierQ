function ScanController(
    $scope,
    $element,
    $attrs,
    $http,
    $sce,
    $location,
    $socket,
    userService,
) {
    var vm = this;

    if (!userService.getUser().isLogin) {
        $location.url('/');
    }

    var api =
        (userService.getUser().deviceList || []).length > 0
            ? 'login'
            : 'generator';

    if ($socket.id) {
        vm.url = prepareUrl(url, api, $socket.id);
        vm.qrcodeImg = createQrcodeImage(url, api, $socket.id);
    }

    $socket.on('connect', function() {
        vm.url = prepareUrl(url, api, $socket.id);
        vm.qrcodeImg = createQrcodeImage(url, api, $socket.id);
        $scope.$apply();
    });

    function createQrcodeImage(url, api, socketId) {
        var typeNumber = 8;
        var errorCorrectionLevel = 'L';
        var qr = qrcode(typeNumber, errorCorrectionLevel);
        var qrvalue = prepareUrl(url, api, socketId);
        console.log(qrvalue);
        qr.addData(qrvalue);
        qr.make();
        return qr.createDataURL();
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
            `.${userService.getUser().username}`,
        ].join('');
    }
}

app.component('scanComponent', {
    templateUrl: '/static/html/scan.html',
    controller: [
        '$scope',
        '$element',
        '$attrs',
        '$http',
        '$sce',
        '$location',
        '$socket',
        'userService',
        ScanController,
    ],
    controllerAs: 'vm',
});
