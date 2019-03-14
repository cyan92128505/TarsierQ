const crypto = require('crypto');
const os = require('os');
const path = require('path');

const express = require('express');
const Datastore = require('nedb');
const bodyParser = require('body-parser');
const { qrcode } = require('pure-svg-code');

const app = express();

app.set('view engine', 'ejs');
const db = new Datastore('server.db');
db.loadDatabase(() => exec());

function exec() {
    db.findOne().exec((err, docs) =>
        err != null ? console.log(`ERROR: ${err}`) : console.log(`DB: ${docs}`)
    );

    var user = null;

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
        const ip = `http://${
            !!ifaces.eth0 ? ifaces.eth0[0].address : '192.168.88.194'
        }:3000/generator`;
        const secret = 'tarsier';
        const hash = crypto
            .createHmac('sha256', secret)
            .update('/ac001/user')
            .digest('hex');

        const svgString = qrcode(`{\"url\": \"${ip}\",\"hash\": \"${hash}\"}`);
        res.render(path.join(process.cwd(), 'view', 'index.ejs'), {
            svgString: svgString,
            url: encodeURIComponent(ip),
            hash: hash,
        });
    });

    app.post('/generator', (req, res, next) => {
        const secret = 'tarsier';
        const hash = crypto
            .createHmac('sha256', secret)
            .update(req.body.deviceId)
            .digest('hex');

        if (user) {
            io.to(user).emit('sendMessage', {
                deviceId: req.body.deviceId,
            });
        }

        res.send(hash);
    });

    app.post('/tarsier-login/:deviceId', (req, res, next) => {
        const _deviceId = req.params.deviceId;
        const _seedId = req.body.seedId;
        res.send(_deviceId);
    });
}
