const crypto = require('crypto');
const algorithm = 'aes-128-cbc';
const key = new Buffer.from('0000000000000000', 'utf8');
const iv = new Buffer.from('0000000000000000', 'utf8');

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
