'use strict';

const readText = require('./readText');

module.exports = readJson;

function readJson(path, callback) {
    readText(path, (err, data) => {

        var ret = null;

        if(err)
            return callback(err);

        try {
            ret = JSON.parse(data);
        } catch(e) {
            return callback(e);
        }

        return callback(null, ret);
    });
}
