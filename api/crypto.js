const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const algorithm = 'aes-128-cbc';
let keyConfigPath = path.join(process.cwd(), 'config', 'key.json');
let keyConfig = {
    key: '0000000000000000',
    iv: '0000000000000000'
};
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