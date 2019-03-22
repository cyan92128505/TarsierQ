function HomeController(
    $scope,
    $element,
    $attrs,
    $http,
    $location,
    $timeout,
    $q,
    userService,
) {
    var vm = this;
    var deferred = $q.defer();
    var promise = deferred.promise;
    promise.then(function() {
        loginAction();
    });

    vm.user = {
        username: '',
        password: '',
    };

    vm.vaildCheckNumber = getRandomFourInt();

    jigsaw.init({
        el: document.getElementById('container'),
        onSuccess: function() {
            deferred.resolve();
        },
        onFail: function() {
            $('#validModal').modal('hide');
        },
        onRefresh: function() {
            $('#validModal').modal('hide');
        },
    });

    vm.login = function() {
        if (vm.vaildCheckNumber != vm.validNumber) {
            vm.invalid = true;
            return;
        }
        $('#validModal').modal('show');
    };

    if (userService.detectState()) {
        $location.url('/account');
    }

    function getRandomFourInt() {
        var min = Math.ceil(0);
        var max = Math.floor(9999);
        var seed = Math.floor(Math.random() * (max - min)) + min;
        return ('a' + (10000 + seed)).replace('a1', '');
    }

    function loginAction() {
        userService
            .login(vm.user.username, vm.user.password)
            .then(function(res) {
                console.log(!res.data);
                $('#validModal').modal('hide');
                if (!res.data) {
                    vm.invalid = true;
                    return;
                }
                vm.invalid = false;
                $timeout(function() {
                    userService.setupUser(res.data).then(function(needScan) {
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
        HomeController,
    ],
    controllerAs: 'vm',
});
