const crypto = require('crypto');
const errorMsg = {
    noDeviceId: `ERROR to generate,no deviceId`,
    existDeviceId: `ERROR to generate,exist deviceId`,
    noSocketId: `ERROR to generate,socketId error`,
};
const multiparty = require('multiparty');

function normalResponse(status, message) {
    if (status) {
        return {
            "IsSuccess": true,
        }

    }
    return {
        "IsSuccess": false,
        "ErrorMessage": message,
        "ErrorType": "Tarsier Error"
    }
}

module.exports = function api(app, io, userList, clientList) {
    app.post('/generator', (req, res, next) => {
        let formParser = new multiparty.Form();
        formParser.parse(req, function (err, fields, files) {
            const _deviceId = fields.deviceId[0] || null;
            const _deviceName = fields.deviceName[0] || null;
            const _socketId = fields.key[0].split('.')[0];
            const _username = fields.key[0].split('.')[1];
            const currentUser = userList.filter(u => u.username === _username)[0];

            if (!_deviceId) {
                console.log(errorMsg.noDeviceId);
                res.send(normalResponse(false, errorMsg.noDeviceId));
                return;
            }

            if (!currentUser) {
                console.log(errorMsg.noSocketId, userList);
                res.send(normalResponse(false, errorMsg.noSocketId));
                return;
            }

            if (clientList.some(e => e.deviceId === _deviceId) && !currentUser) {
                console.log(errorMsg.existDeviceId, currentUser, clientList);
                res.send(normalResponse(false, errorMsg.existDeviceId));
                return;
            }

            // const secret = 'tarsier';
            // const token = crypto
            //     .createHmac('sha256', secret)
            //     .update(_deviceId + _socketId + _username)
            //     .digest('hex');

            const token = `${_socketId}.${_username}`;

            const client = {
                deviceId: _deviceId,
                deviceName: _deviceName,
                token: token,
                login: true,
                username: currentUser.username,
            };

            clientList.push(client);

            console.log(`io.to(${_socketId}).emit('refresh');`);
            io.to(_socketId).emit('refresh');

            return res.json(normalResponse(true));
        });
    });

    app.post('/login', (req, res, next) => {
        let formParser = new multiparty.Form();
        formParser.parse(req, function (err, fields, files) {
            const _deviceId = fields.deviceId[0];
            const _socketId = fields.key[0].split('.')[0];
            const _username = fields.key[0].split('.')[1];
            const _token = fields.token[0];

            if (
                !clientList.some(c => {
                    const state =
                        c.deviceId === _deviceId &&
                        c.token === _token &&
                        c.username === _username;
                    if (state) {
                        c.login = true;
                    }
                    return state;
                })
            ) {
                console.log(
                    `ERROR to login, token:${_token}, device: ${_deviceId}`,
                );

                res.json(normalResponse(false, `ERROR to login, token:${_token}, device: ${_deviceId}`));

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
                res.json(normalResponse(false, 'ERROR to login, no user'));
                return;
            }

            console.log(`io.to(${_socketId}).emit('refresh');`);
            io.to(_socketId).emit('refresh');
            return res.json(normalResponse(true));
        });
    });
};