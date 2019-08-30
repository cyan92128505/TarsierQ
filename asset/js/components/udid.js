function UdidController(
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
    vm.url = url + '/udid.mobileconfig';
}

app.component('udidComponent', {
    templateUrl: '/static/html/udid.html',
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
        UdidController,
    ],
    controllerAs: 'vm',
});