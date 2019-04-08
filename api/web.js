const crypto = require('./crypto');

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
        return res.json(state ? currentUser : null);
    });

    app.post('/client', (req, res, next) => {
        const username = req.body.username;

        return res.json({
            clientList: clientList ?
                clientList.filter(
                    c => c.deviceId != 0 && c.username == username,
                ) : [],
        });
    });

    app.post('/logout', (req, res, next) => {
        const username = req.body.username;
        const socketId = req.header('socketId');

        const currentUser = userList.filter(u => {
            const state = u.username === username;
            if (state) {
                u.islogin = false;
            }
            return state;
        })[0];

        if (!currentUser) {
            return res.send();
        }

        clientList
            .filter(c => c.username === currentUser.username)
            .forEach(c => (c.login = false));

        io.to(socketId || currentUser.socketId).emit('refresh');

        return res.json({
            clientList: clientList,
        });
    });

    app.get('/clear', (req, res, next) => {
        clientList.splice(1);
        io.emit('refresh');
        return res.json({
            clientList: clientList,
        });
    });

    app.use('/all', (req, res, next) => {
        return res.json({
            userList: userList,
            clientList: clientList,
        });
    });

    app.post('/remove', (req, res, next) => {
        const deviceId = req.body.deviceId;
        const username = req.body.username;

        const tmpList = clientList.filter(
            c =>
            c.deveiceId != deviceId &&
            c.username != username &&
            c.deveiceId != 0,
        );

        clientList.splice(1);
        clientList.concat(tmpList);

        return res.json(clientList.filter(c => c.username === username));
    });

    app.post('/qr', (req, res, next) => {
        const optionString = JSON.stringify(req.body);
        console.log(optionString);
        const encrypted = crypto.encrypt(optionString);
        console.log(encrypted);
        return res.send(encrypted);
    });

    app.post('/pingpong', (req, res, next) => {
        console.log(req.body);
        return res.send(req.body);
        //return res.status(404).end('SCAN ERROR');
    });
};