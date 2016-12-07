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
        help: 'The name of the table to backup .',
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

    var ddbClient = new AWS.DynamoDB.DocumentClient({
        region: opts.region 
    });

    var params = {
        "TableName": opts.SOURCE
    };

    ddbClient.scan(params, function(err, data) {
        if(err) {
            console.error(err);
        } else {
            console.info(JSON.stringify(data.Items));
        }
    });
};

main(getOpts());
