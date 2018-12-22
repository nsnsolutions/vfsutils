'use strict';

const UrlParser = require('url')
const fs = require('fs');

module.exports = readText;

function fromStdin(callback) {

    var stdin = [];
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
        stdin.push(chunk);
    });

    process.stdin.on('end', function() {
        callback(null, stdin.join());
    });
}

function fromFile(path, callback) {
    fs.readFile(path, (err, data) => {
        if(err)
            return callback(err);
        callback(null, data.toString('utf8'));
    });
}

function fromUrl(url, callback) {
    var http = null;
    if(url.startsWith("https://"))
        http = require('https');
    else
        http = require('http');

    var req = http.get(url, (res) => {

        var statusCode = res.statusCode,
            rawData = [];

        if(statusCode > 299 || statusCode < 200) {
            res.resume();

            return callback({
                name: "Error",
                message: "Failed to read text from url. StatusCode: " + statusCode
            });
        }

        res.setEncoding('utf8');
        res.on('data', (chunk) => rawData.push(chunk));
        res.on('end', () => callback(null, rawData.join()));
    });

    req.on('error', (e) => callback(e));
}

function readText(path, callback) {
    if(path === '-')
        return fromStdin(callback);
    else if(path.startsWith("http://") || path.startsWith("https://"))
        return fromUrl(path, callback);
    else
        return fromFile(path, callback);
}

