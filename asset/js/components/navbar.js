function NavbarController(
    $scope,
    $element,
    $attrs,
    $http,
    $location,
    $socket,
    userService,
    languageService,
) {
    var vm = this;
    languageService.setup(vm);
    $socket.on('connect', () => {
        vm.socketId = $socket.id;
        userService.safeApply($scope);
    });

    $socket.on('refresh', function () {
        userService.getClientList().then(function () {
            $location.url('/');
        });
    });
}

app.component('navbarComponent', {
    templateUrl: '/static/html/navbar.html',
    controller: [
        '$scope',
        '$element',
        '$attrs',
        '$http',
        '$location',
        '$socket',
        'userService',
        'languageService',
        NavbarController,
    ],
    controllerAs: 'vm',
});