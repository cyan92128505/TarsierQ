function NavbarController($scope, $element, $attrs, $http, $socket) {
    var vm = this;
    $socket.on('connect', () => {
        vm.socketId = $socket.id;
        $scope.$apply();
    });
}

app.component('navbarComponent', {
    templateUrl: '/static/html/navbar.html',
    controller: [
        '$scope',
        '$element',
        '$attrs',
        '$http',
        '$socket',
        NavbarController,
    ],
    controllerAs: 'vm',
});
