function ScanController($scope, $element, $attrs, $http) {
    var vm = this;
}

app.component('scanComponent', {
    templateUrl: '/static/html/scan.html',
    controller: ['$scope', '$element', '$attrs', '$http', ScanController],
    controllerAs: 'vm',
});
