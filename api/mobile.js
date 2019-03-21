const crypto = require('crypto');
const errorMsg = {
    noDeviceId: `ERROR to generate,no deviceId`,
    existDeviceId: `ERROR to generate,exist deviceId`,
    noSocketId: `ERROR to generate,socketId error`,
};
module.exports = function api(app, io, userList, clientList) {
    app.post('/generator', (req, res, next) => {
        const _deviceId = req.body.deviceId || null;
        const _socketId = req.body.hash.split('.')[0];
        const _username = req.body.hash.split('.')[1];
        const currentUser = userList.filter(u => u.username === _username)[0];

        if (!_deviceId) {
            console.log(errorMsg.noDeviceId);
            res.send(errorMsg.noDeviceId);
            return;
        }

        if (!currentUser) {
            console.log(errorMsg.noSocketId, userList);
            res.send(errorMsg.noSocketId);
            return;
        }

        if (clientList.some(e => e.deviceId === _deviceId) && !!currentUser) {
            console.log(errorMsg.existDeviceId, clientList);
            res.send(errorMsg.existDeviceId);
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
            login: true,
            username: currentUser.username,
        };

        clientList.push(client);

        console.log(`io.to(${_socketId}).emit('refresh');`);
        io.to(_socketId).emit('refresh');

        const result = `{"token": "${token}", "user": "${
            currentUser.username
        }"}`;

        console.log(result);
        res.send(result);
    });

    app.post('/login', (req, res, next) => {
        const _deviceId = req.body.deviceId;
        const _socketId = req.body.hash.split('.')[0];
        const _username = req.body.hash.split('.')[1];
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
                `ERROR to login, token:${_token}, device: ${_deviceId}`,
            );

            res.send(`ERROR to login, token:${_token}, device: ${_deviceId}`);
            return;
        }

        const result = `token: ${_token}`;
        console.log(result);
        const currentClient = clientList.filter(
            c => c.deviceId === _deviceId && c.token === _token,
        )[0];
        const targetUser = userList.filter(
            u => u.username === currentClient.username,
        )[0];

        if (!targetUser) {
            res.send('ERROR to login, no user');
            return;
        }

        console.log(`io.to(${_socketId}).emit('refresh');`);
        io.to(_socketId).emit('refresh');
        res.send(result);
    });
};
