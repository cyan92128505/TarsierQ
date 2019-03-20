const crypto = require('crypto');
const os = require('os');
const path = require('path');

module.exports = function api(app, io, userList, clientList) {
    const ip = getIP()[0];
    console.log(`server run on: ${ip}:3000`)
    io.sockets.on('connection', function (socket) {
        socket.emit('sendMessage', {
            hello: 'world'
        });
        socket.on('sendMessage', function (data) {
            user = data;
            console.log(data);
        });
    });

    function getIP() {
        return Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), []);
    }

    function rootView(req, res, next) {
        const url = `${ip}:3000`;

        res.render(path.join(process.cwd(), 'view', 'index.ejs'), {
            url: encodeURIComponent(url),
            rawUrl: url,
        });
    }

    app.get('/', rootView);
    app.get('/scan', rootView);
    app.get('/account', rootView);
    app.get('/404', rootView);

    app.post('/weblogin', (req, res, next) => {
        const socketId = req.header('socketId');
        const username = req.body.username;
        const password = req.body.password;
        const state = userList.some(u => {
            if (u.username != username || u.password != password) {
                return false;
            }

            u.socketId = socketId;
        });

        res.send(state);
    });

    app.post('/getUser', (res, req, next) => {

    });

    app.post('/client', (req, res, next) => {
        const username = req.body.username;

        res.json({
            clientList: clientList ?
                clientList.filter(
                    c => c.deviceId != 0 && c.username == username
                ) : [],
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

    app.post('/generator', (req, res, next) => {
        const _deviceId = req.body.deviceId || null;
        const _socketId = req.body.hash;
        const currentUser = userList.filter(u => u.socketId === _socketId)[0];

        if (!_deviceId) {
            console.log('No deviceId');
            res.send(`ERROR to generate,No deviceId`);
            return;
        }

        if (clientList.some(e => e.deviceId === _deviceId)) {
            console.log('Exist deviceId');
            res.send(`ERROR to generate,Exist deviceId`);
            return;
        }
        if (!currentUser) {
            console.log('No socketId');
            res.send(`ERROR to generate,No socketId`);
            return;
        }

        const secret = 'tarsier';
        const token = crypto
            .createHmac('sha256', secret)
            .update(req.body.deviceId)
            .digest('hex');

        const client = {
            deviceId: req.body.deviceId,
            token: token,
            login: false,
            username: currentUser.username,
        };

        clientList.push(client);

        io.to(currentUser.socktId).emit('newClient', client);

        const result = `{"token": "${token}", "user": "${
            currentUser.username
        }"}`;

        console.log(result);
        res.send(result);
    });

    app.post('/login', (req, res, next) => {
        const _deviceId = req.body.deviceId;
        const _token = req.body.token;

        if (
            !clientList.some(c => {
                const state = c.deviceId === _deviceId && c.token === _token;
                if (state) {
                    c.login = true;
                }
                return state;
            })
        ) {
            console.log(
                `ERROR to login, token:${_token}, device: ${_deviceId}`
            );

            res.send(`ERROR to login, token:${_token}, device: ${_deviceId}`);
            return;
        }

        const result = `token: ${_token}`;
        console.log(result);
        const currentClient = clientList.filter(
            c => c.deviceId === _deviceId && c.token === _token
        )[0];
        const targetUser = userList.filter(
            u => u.username === currentClient.username
        )[0];

        if (!targetUser) {
            res.send('ERROR to login, no user');
            return;
        }

        io.to(targetUser.socketId).emit('newClient', currentClient);
        res.send(result);
    });

    app.use('/*', rootView);
};