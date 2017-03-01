'use strict';

const Redis = require('redis');
const AWS = require('aws-sdk');
const fs = require('fs');
const async = require('async');

module.exports = function populateTableSchema(opts, console, done) {

    var tables = opts.TABLE,
        redis = Redis.createClient({ url: opts.redis_uri }),
        ddbClient = new AWS.DynamoDB({ region: opts.region });

    async.each(tables, (table, next) => {
        var params = { TableName: table },
            cacheKey = computeTableKey(table);

        console.info(`Reading data from ${table}`);

        ddbClient.describeTable(params, (err, data) => {

            if(err)
                return next(err);

            console.debug("Recieved data:\n", data.Table);

            let _data;

            try { _data = JSON.stringify(data.Table); }
            catch(e) { return next(e); }

            console.info("SET: " + cacheKey);

            redis.set(cacheKey, _data, next);
        });

    }, (e) => {
        redis.quit();
        done(e)
    });
}

function computeTableKey(table) {

    /*
     * DynamoDB:TableDescription:Table=VFS_Jobs
     */

    return `DynamoDB:TableDescription:Table=${table}`
}

