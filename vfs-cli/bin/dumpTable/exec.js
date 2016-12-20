'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

module.exports = function dumpTable(opts, console, done) {

    var source = opts.SOURCE,
        target = opts.TARGET,
        ddbClient = new AWS.DynamoDB.DocumentClient({ region: opts.region }),
        params = { TableName: source };

    console.info(`Reading data from ${source}`);

    ddbClient.scan(params, (err, data) => {

        if(err)
            return done(err);

        console.debug("Recieved data:\n", data);
        console.info(`Writing ${data.Items.length} records to ${target}`);

        var data = JSON.stringify(data.Items, null, 4);

        if(target === '-') {
            console.debug("Writing output to STDOUT.");
            console.write(data);
        } else {
            console.debug("Writing output to file.");
            fs.writeFile(target, data, {}, done);
        }
    });
}

