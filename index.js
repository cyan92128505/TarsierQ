const crypto = require('crypto');
const os = require('os');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const clientList = [
    {
        deviceId: 0,
        token: '',
        login: false,
    },
];

const app = express();

app.set('view engine', 'ejs');

const server = app.listen(3000);

const io = require('socket.io')(server, {
    transports: ['websocket'],
});

io.sockets.on('connection', function(socket) {
    socket.emit('sendMessage', { hello: 'world' });
    socket.on('sendMessage', function(data) {
        user = data;
        console.log(data);
    });
});

app.use('/static', express.static(path.join(process.cwd(), 'asset')));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());

app.get('/', function(req, res) {
    const ifaces = os.networkInterfaces();
    const url = `http://${
        !!ifaces.eth0 ? ifaces.eth0[0].address : '192.168.88.194'
    }:3000`;

    res.render(path.join(process.cwd(), 'view', 'index.ejs'), {
        url: encodeURIComponent(url),
        rawUrl: url,
    });
});

app.get('/client', (req, res, next) => {
    res.json({
        clientList: clientList.filter(c => c.deviceId != 0),
    });
});

app.get('/clear', () => {
    clientList = clientList.filter(c => c.deviceId === 0);
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
    };

    clientList.push(client);

    io.to(_user).emit('sendMessage', client);

    const result = `{"token": "${hash}", "user": "${_user}"}`;
    console.log(result);
    res.send(result);
});

app.post('/login/:deviceId', (req, res, next) => {
    const _deviceId = req.params.deviceId;
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
        res.send(`ERROR to login`);
        return;
    }

    const result = `token: ${_token}, user: ${_user}`;
    console.log(result);
    res.send(result);
});
