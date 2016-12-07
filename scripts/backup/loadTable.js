#!/usr/bin/env node

'use strict';

const AWS = require('aws-sdk');
const ArgumentParser = require('argparse').ArgumentParser;
const packageJSON = require('./package.json');

function getOpts() {
    var ap = new ArgumentParser({
        version: packageJSON.version,
        addHelp: true,
        description: packageJSON.description
    });
    
    ap.addArgument([ 'SOURCE' ], {
        help: 'A path to json file to load into the target table.',
        type: String
    });

    ap.addArgument([ 'TARGET' ], {
        help: 'The name of the table to insert the data.',
        type: String
    });

    ap.addArgument([ '--region' ], {
        help: 'Override the region to connect to.',
        type: String,
        defaultValue: 'us-west-2'
    });

    return ap.parseArgs();
}

function main(opts) {
    var TABLENAME = "VFS_Product";

    var doc = new AWS.DynamoDB.DocumentClient({
        region: opts.region
    });

    const fs = require('fs');

    fs.readFile(opts.SOURCE, 'utf-8', function(err, data) {
        var _data = JSON.parse(data);

        _data.forEach(function(datum) {
            doc.put({
                TableName: opts.TARGET,
                Item: datum
            }, function(err, data) {
                if(err) {
                    return console.error("Failed to import. Abort!", err);
                    process.exit(1);
                }
            });
        });
    });
};

main(getOpts());
