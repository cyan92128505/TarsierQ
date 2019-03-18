const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const api = require(path.join(process.cwd(), 'api', 'main.js'));

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

app.use('/static', express.static(path.join(process.cwd(), 'asset')));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());
api(app, clientList, io);
