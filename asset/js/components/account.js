function AccountController(
    $scope,
    $element,
    $attrs,
    $http,
    $location,
    userService,
) {
    var vm = this;
    vm.user = userService.getUser().username;
    vm.deviceList = userService.getUser().deviceList;
    vm.hasDevice = vm.deviceList.length > 0;

    vm.logout = function() {
        userService.logout().then(function(res) {
            $location.url('/');
        });
    };

    vm.remove = function(d) {
        console.log(d);
        $http
            .post('/remove', {
                deviceId: d.deviceId,
                username: d.username,
            })
            .then(function(res) {
                vm.deviceList = res.data;
                vm.hasDevice = vm.deviceList.length > 0;
                userService.getClientList();
            });
    };

    if (!userService.detectState()) {
        $location.url('/');
    }
}

app.component('accountComponent', {
    templateUrl: '/static/html/account.html',
    controller: [
        '$scope',
        '$element',
        '$attrs',
        '$http',
        '$location',
        'userService',
        AccountController,
    ],
    controllerAs: 'vm',
});
