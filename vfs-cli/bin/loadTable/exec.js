'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const lib = require('../../lib');

module.exports = function loadTable(opts, console, done) {

    var target = opts.TARGET,
        source = opts.SOURCE,
        ddbClient = new AWS.DynamoDB.DocumentClient({ region: opts.region });

    console.info(`Reading data from ${source}`);

    lib.readJson(source, (err, data) => {

        if(err)
            return done(err);

        console.debug("Recieved data:\n", data);
        console.info(`Writing ${data.length} records to ${target}`);

        data.forEach(function(item) {

            var params = {
                TableName: target,
                Item: item
            };

            ddbClient.put(params, (err, data) => {
                if(err)
                    return done(err);

                console.debug("Put Item complete.");
            });
        });
    })
}


