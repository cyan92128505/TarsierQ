const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const api = require(path.join(process.cwd(), 'api', 'main.js'));

const clientList = [
    {
        deviceId: 0,
        token: '',
        login: false,
        username: 'admin',
    },
];

const userList = [
    {
        username: 'user',
        password: '123456',
        socketId: null,
        islogin: false,
    },
    {
        username: 'non',
        password: '123456',
        socketId: null,
        islogin: false,
    },
];

const app = express();
app.use(
    morgan('tiny', {
        skip: (req, res) => /static|\.ico/.test(req.originalUrl),
    }),
);
app.set('view engine', 'ejs');

const server = app.listen(3000);

const io = require('socket.io')(server, {
    transports: ['websocket'],
});

app.use('/static', express.static(path.join(process.cwd(), 'asset')));
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

app.use(bodyParser.json());
// setup route
api(app, io, userList, clientList);
