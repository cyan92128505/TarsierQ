function HomeController(
    $scope,
    $element,
    $attrs,
    $http,
    $location,
    userService,
) {
    var vm = this;

    vm.user = {
        username: '',
        password: '',
    };

    vm.login = function() {
        userService
            .login(vm.user.username, vm.user.password)
            .then(function(res) {
                console.log(!res.data);
                if (!res.data) {
                    vm.invalid = true;
                    return;
                }
                vm.invalid = false;
                userService.setupUser(res.data).then(function(needScan) {
                    $location.url(needScan ? '/scan' : '/account');
                });
            });
    };

    if (userService.getUser().isLogin) {
        $location.url('/account');
    }
}

app.component('homeComponent', {
    templateUrl: '/static/html/home.html',
    controller: [
        '$scope',
        '$element',
        '$attrs',
        '$http',
        '$location',
        'userService',
        HomeController,
    ],
    controllerAs: 'vm',
});
