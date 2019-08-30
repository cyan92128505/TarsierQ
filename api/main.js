const path = require('path');
const webApi = require(path.join(process.cwd(), 'api', 'web.js'));
const mobileApi = require(path.join(process.cwd(), 'api', 'mobile.js'));
const udidApi = require(path.join(process.cwd(), 'api', 'udid.js'));

module.exports = function api(app, io, userList, clientList) {
    console.log(getIPList());
    // find local ip
    const ip = (getIPList().filter(u => /192/.test(u) || /172/.test(u)) || ['localhost'])[0];

    console.log(`server on: ${ip}`);
    io.sockets.on('connection', function (socket) {
        socket.emit('sendMessage', {
            hello: 'world',
        });
        socket.on('sendMessage', function (data) {
            user = data;
            console.log(data);
        });
    });

    function getIPList() {
        return Object.values(require('os').networkInterfaces()).reduce(
            (r, list) =>
            r.concat(
                list.reduce(
                    (rr, i) =>
                    rr.concat(
                        (i.family === 'IPv4' &&
                            !i.internal &&
                            i.address) || [],
                    ),
                    [],
                ),
            ),
            [],
        );
    }

    function rootView(req, res, next) {
        res.render(path.join(process.cwd(), 'view', 'index.ejs'));
    }

    app.get('/', rootView);
    app.get('/scan', rootView);
    app.get('/account', rootView);
    app.get('/404', rootView);
    app.get('/pingpong', rootView);

    webApi(app, io, userList, clientList);
    mobileApi(app, io, userList, clientList);
    udidApi(app, io, userList, clientList);

    app.use('/*', rootView);
};