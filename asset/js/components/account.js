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
    vm.hasDevice = userService.getUser().deviceList.length > 0;
    vm.logout = function() {
        userService.logout().then(function(res) {
            $location.url('/');
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
