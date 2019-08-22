app.factory('languageService', [
    function () {
        var dict = {
            account: 'account',
            password: 'password',
            login: 'login',
            IncorrectAccountPassword: 'Incorrect account password',
            bindingDevice: 'Binding device',
            logout: 'logout',
            register: 'register'
        };
        var service = {
            setup: function ($scope) {
                $scope.lang = dict;
            }
        };

        return service;
    },
]);