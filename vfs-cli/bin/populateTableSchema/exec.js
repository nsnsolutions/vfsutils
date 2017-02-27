'use strict';

const Redis = require('redis');
const AWS = require('aws-sdk');
const fs = require('fs');

module.exports = function populateTableSchema(opts, console, done) {

    var table = opts.TABLE,
        redis = Redis.createClient({ url: opts.redis_uri }),
        ddbClient = new AWS.DynamoDB({ region: opts.region }),
        params = { TableName: table },
        cacheKey = computeTableKey(table);

    console.info(`Reading data from ${table}`);

    ddbClient.describeTable(params, (err, data) => {

        if(err)
            return done(err);

        console.debug("Recieved data:\n", data.Table);

        let _data;

        try { _data = JSON.stringify(data.Table); }
        catch(e) { return done(e); }

        console.info("SET: " + cacheKey);

        redis.set(cacheKey, _data, done);
    });
}

function computeTableKey(table) {
    return `TABLE:${table}`
}

