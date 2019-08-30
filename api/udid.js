const xml2json = require('xml2json');

module.exports = function api(app, io, userList, clientList) {
    app.get('/udid.mobileconfig', (req, res, next) => {
        res.writeHead(200, {
            'Content-Type': 'application/x-apple-aspen-config'
        });
        res.end(mobileconfigContent('http://192.168.88.31/udid'));
    });

    app.post('/udid', function (req, res, next) {
        req.rawBody = ''; //添加接收变量
        var json = {};
        req.setEncoding('utf8');
        req.on('data', function (chunk) {
            req.rawBody += chunk;
        });
        req.on('end', function () {
            console.log(req.rawBody);
            res.send(req.rawBody);
        });
    });

}


function mobileconfigFileName() {
    return 'udid.mobileconfig';
}

function mobileconfigContent(url) {
    return `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>PayloadContent</key>
        <dict>
            <key>URL</key>
            <string>${url}</string>
            <key>DeviceAttributes</key>
            <array>
                <string>UDID</string>
                <string>IMEI</string>
                <string>ICCID</string>
                <string>VERSION</string>
                <string>PRODUCT</string>
            </array>
        </dict>
        <key>PayloadOrganization</key>
        <string>com.aoma.tarsierq</string>
        <key>PayloadDisplayName</key>
        <string>GET UDID</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadUUID</key>
        <string>833a1de0-484b-43ad-9cef-13c70e952660</string>
        <key>PayloadIdentifier</key>
        <string>com.aoma.tarsierq-udid</string>
        <key>PayloadDescription</key>
        <string>GET UDID</string>
        <key>PayloadType</key>
        <string>Profile Service</string>
    </dict>
</plist>
`;
}