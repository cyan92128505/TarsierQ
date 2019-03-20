function HomeController($scope, $element, $attrs, $http, $location) {
    var vm = this;
    vm.user = {
        username: '',
        password: '',
    };

    vm.login = function() {
        console.log(vm.user);
        $http.get('/weblogin', vm.user).then(function(res) {
            if (res) {
                $location.replace('/');
            }
        });
    };
}

app.component('homeComponent', {
    templateUrl: '/static/html/home.html',
    controller: [
        '$scope',
        '$element',
        '$attrs',
        '$http',
        '$location',
        HomeController,
    ],
    controllerAs: 'vm',
});
