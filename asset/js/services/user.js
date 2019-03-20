app.factory('userService', [
    '$http',
    function($http) {
        var user = {
            username: '',
            isLogin: false,
            deviceList: [],
        };

        return {
            login: function(username, password) {
                return $http.post('/weblogin', {
                    username: username,
                    password: password,
                });
            },

            logout: function() {
                user.isLogin = true;
                return $http.post('/logout?t=' + new Date().valueOf(), {
                    username: user.username,
                });
            },
        };
    },
]);
