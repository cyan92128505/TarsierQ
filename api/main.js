const crypto = require('crypto');
const os = require('os');
const path = require('path');

module.exports = function api(app, clientList, io) {
    io.sockets.on('connection', function(socket) {
        socket.emit('sendMessage', { hello: 'world' });
        socket.on('sendMessage', function(data) {
            user = data;
            console.log(data);
        });
    });

    app.get('/', function(req, res) {
        const ifaces = os.networkInterfaces();
        const url = `${
            !!ifaces.eth0 ? ifaces.eth0[0].address : '192.168.88.194'
        }:3000`;

        res.render(path.join(process.cwd(), 'view', 'index.ejs'), {
            url: encodeURIComponent(url),
            rawUrl: url,
        });
    });

    app.get('/client', (req, res, next) => {
        res.json({
            clientList: clientList
                ? clientList.filter(c => c.deviceId != 0)
                : [],
        });
    });

    app.get('/logout', (req, res, next) => {
        clientList.forEach(c => (c.login = false));

        io.emit('refresh');

        res.json({
            clientList: clientList,
        });
    });

    app.get('/clear', (req, res, next) => {
        clientList = clientList.filter(c => c.deviceId === 0);
        io.emit('refresh');
        res.json({
            clientList: clientList,
        });
    });

    app.post('/generator', (req, res, next) => {
        const _deviceId = req.body.deviceId || null;
        const _user = req.body.hash;
        if (!_deviceId) {
            console.log('No deviceId');
            res.send(`ERROR to generate`);
            return;
        }

        if (clientList.some(e => e.deviceId === _deviceId)) {
            console.log('Exist deviceId');
            res.send(`ERROR to generate`);
            return;
        }

        const secret = 'tarsier';
        const hash = crypto
            .createHmac('sha256', secret)
            .update(req.body.deviceId)
            .digest('hex');

        const client = {
            deviceId: req.body.deviceId,
            token: hash,
            login: false,
        };

        clientList.push(client);

        io.emit('newClient', client);

        const result = `{"token": "${hash}", "user": "${_user}"}`;
        console.log(result);
        res.send(result);
    });

    app.post('/login', (req, res, next) => {
        const _deviceId = req.body.deviceId;
        const _user = req.body.hash;
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
            console.log(`ERROR to login`);
            console.log(req.body);
            res.send(`ERROR to login`);
            return;
        }

        const result = `token: ${_token}, user: ${_user}`;
        console.log(result);

        io.emit(
            'newClient',
            clientList.filter(
                c => c.deviceId === _deviceId && c.token === _token
            )[0]
        );
        res.send(result);
    });
};
