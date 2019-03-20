function AccountController($scope, $element, $attrs, $http) {
    var vm = this;
}

app.component('accountComponent', {
    templateUrl: '/static/html/account.html',
    controller: ['$scope', '$element', '$attrs', '$http', AccountController],
    controllerAs: 'vm',
});
