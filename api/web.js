module.exports = function api(app, io, userList, clientList) {
    app.post('/weblogin', (req, res, next) => {
        const socketId = req.header('socketId');
        const username = req.body.username;
        const password = req.body.password;

        let currentUser = null;
        const state =
            userList.filter(u => {
                const state =
                    u.username === username && u.password === password;
                if (state) {
                    u.socketId = socketId;
                    u.islogin = true;
                    currentUser = u;
                }
                return state;
            }).length != 0;
        res.json(state ? currentUser : null);
    });

    app.post('/client', (req, res, next) => {
        const username = req.body.username;

        res.json({
            clientList: clientList
                ? clientList.filter(
                      c => c.deviceId != 0 && c.username == username,
                  )
                : [],
        });
    });

    app.get('/logout', (req, res, next) => {
        const socketId = req.header('socketId');
        if (!socketId) {
            return res.send();
        }

        const currentUser = userList.filter(u => u.socketId === socketId)[0];
        if (!currentUser) {
            return res.send();
        }

        clientList
            .filter(c => c.username === currentUser.username)
            .forEach(c => (c.login = false));

        io.to(currentUser.socketId).emit('refresh');

        res.json({
            clientList: clientList,
        });
    });

    app.get('/clear', (req, res, next) => {
        const username = req.body.username;

        clientList = clientList.filter(c => c.username != username);
        io.emit('refresh', username);
        res.json({
            clientList: clientList,
        });
    });
};
