function NavbarController(
    $scope,
    $element,
    $attrs,
    $http,
    $location,
    $socket,
    userService,
) {
    var vm = this;
    $socket.on('connect', () => {
        vm.socketId = $socket.id;
        $scope.$apply();
    });

    $socket.on('refresh', function() {
        userService.getClientList().then(function() {
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
        NavbarController,
    ],
    controllerAs: 'vm',
});
