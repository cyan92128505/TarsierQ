function HomeController(
    $scope,
    $element,
    $attrs,
    $http,
    $location,
    $timeout,
    $q,
    userService,
    languageService,
) {
    var vm = this;
    languageService.setup(vm);
    var deferred = $q.defer();
    var promise = deferred.promise;
    promise.then(function () {
        loginAction();
    });

    vm.user = {
        username: '',
        password: '',
    };

    vm.login = function () {
        loginAction();
    };

    if (userService.detectState()) {
        $location.url('/account');
    }

    function loginAction() {
        userService
            .login(vm.user.username, vm.user.password)
            .then(function (res) {
                console.log(!res.data);
                if (!res.data) {
                    vm.invalid = true;
                    return;
                }
                vm.invalid = false;
                $timeout(function () {
                    userService.setupUser(res.data).then(function (needScan) {
                        $location.url(needScan ? '/scan' : '/account');
                    });
                }, 600);
            });
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
        '$timeout',
        '$q',
        'userService',
        'languageService',
        HomeController,
    ],
    controllerAs: 'vm',
});