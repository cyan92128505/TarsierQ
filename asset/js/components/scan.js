function ScanController(
    $scope,
    $element,
    $attrs,
    $http,
    $sce,
    $location,
    $socket,
    userService,
    languageService,
) {
    var vm = this;
    languageService.setup(vm);
    if (!userService.getUser().isLogin) {
        $location.url('/');
    }
    var qrState = (userService.getUser().deviceList || []).length > 0;
    var api = qrState ? 'login' : 'generator';
    vm.qrText = qrState ? vm.lang.login : vm.lang.register;

    if ($socket.id) {
        getQRCode(url, api, $socket.id).then(res => {
            vm.url = prepareUrl(res.data);
            vm.qrcodeImg = createQrcodeImage();
        });
    }

    $socket.on('connect', function () {
        getQRCode(url, api, $socket.id).then(res => {
            vm.url = prepareUrl(res.data);
            vm.qrcodeImg = createQrcodeImage();
            userService.safeApply($scope);
        });
    });

    function createQrcodeImage() {
        var typeNumber = 8;
        var errorCorrectionLevel = 'L';
        var qr = qrcode(typeNumber, errorCorrectionLevel);
        var qrvalue = vm.url;
        console.log(qrvalue);
        qr.addData(qrvalue);
        qr.make();
        return qr.createDataURL();
    }

    function prepareUrl(code) {
        return 'charon://app/#' + code;
    }

    function getQRCode(url, api, socketId) {
        var option = {
            url: url + '/' + api,
            key: socketId + '.' + userService.getUser().username,
            type: api === 'generator' ? 1 : 2,
        };
        if (api === 'login') {
            option.token = option.key;
        }

        return $http.post('/qr', option);
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
        'languageService',
        ScanController,
    ],
    controllerAs: 'vm',
});