app.factory('userService', [
    '$http',
    'localStorageService',
    function($http, localStorageService) {
        var _user = localStorageService.get('user') || {};
        var user = {
            username: _user.username || '',
            isLogin: !!_user.isLogin,
            deviceList: _user.deviceList || [],
        };

        var service = {
            save: function() {},
            getUser: function() {
                return user;
            },

            setupUser: function(resData) {
                user.username = resData.username;
                user.isLogin = true;
                return this.getClientList();
            },

            getClientList: function() {
                return $http.post('/client', user).then(function(res) {
                    user.deviceList = res.data.clientList;
                    localStorageService.set('user', user);
                    return user.deviceList.length > 0;
                });
            },

            login: function(username, password) {
                user.username = username;
                return $http.post('/weblogin', {
                    username: username,
                    password: password,
                });
            },

            detectState: function() {
                return (
                    user.isLogin &&
                    (user.deviceList.length == 0 ||
                        user.deviceList.filter(d => d.login).length > 0)
                );
            },

            logout: function() {
                var targetUser = user.username;
                user.isLogin = false;
                localStorageService.remove('user');
                return $http.post('/logout', {
                    username: targetUser,
                });
            },
        };

        if (!!_user.username && !!_user.isLogin) {
            service.getClientList();
        }

        return service;
    },
]);
