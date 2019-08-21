const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const program = require('commander');
const algorithm = 'aes-128-cbc';

program
    .option('-k, --app-key <appKey>', 'key')
    .option('-i, --app-iv <appIv>', 'iv');

program.parse(process.argv);

let keyConfigPath = path.join(process.cwd(), 'config', 'key.json');
let keyConfig = {
    key: process.env.APP_KEY || '0000000000000000',
    iv: process.env.APP_IV || '0000000000000000',
};

console.log(keyConfig);

program.args.forEach(a => {
    const list = a.split(' ');
    switch (list[1]) {
        case '--app-key':
            keyConfig.key = list[2];
            break;
        case '--app-iv':
            keyConfig.iv = list[2];
            break;
    }
});

try {
    keyConfig = fs.readJSONSync(path.join(process.cwd(), 'config', 'key.json'));
} catch (error) {
    fs.ensureFileSync(keyConfigPath);
    fs.writeJSONSync(keyConfigPath, keyConfig);
    console.log('NO CONFIG FOR AES!');
}

console.log(keyConfig);
const key = new Buffer.from(keyConfig.key, 'utf8');
const iv = new Buffer.from(keyConfig.iv, 'utf8');

function encrypt(data) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer.from(crypted, 'binary').toString('base64');
    return crypted;
}

function decrypt(crypted) {
    crypted = new Buffer.from(crypted, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
}

module.exports = {
    encrypt,
    decrypt,
};
