#!/usr/bin/env node

'use strict'
const ArgumentParser = require('argparse').ArgumentParser;
const packageJson = require('../package.json');
const cmdPrompt = require('prompt');
const AWS = require('aws-sdk');
const async = require('async');

const protectedTables = [
    'cb_analytics',
    'vfscallbackmap'
];

const prompt_schema = {
    properties: {
        verify: {
            description: "Are you really sure? (yes/no)",
            pattern: /^(yes|no)$/i,
            message: "What's it gunna be? Yes or No?",
            required: true
        }
    }
}

main();

function getOpts() {
    var ap = new ArgumentParser({
        version: `${packageJson.name} v${packageJson.version}`,
        description: packageJson.description,
        addHelp: true
    });

    ap.addArgument(
        ['--region'],
        {
            help: "The AWS region name.",
            defaultValue: 'us-west-2',
            type: String
        }
    );

    ap.addArgument(
        ['--throttle'],
        {
            help: "How long to wait between each delete request.",
            defaultValue: 0.01,
            type: Number
        }
    );

    ap.addArgument(
        ['table'],
        {
            help: "The name of the table to purge.",
            type: String
        }
    );

    return ap.parseArgs();
}

function dumpTable(ddb, tableName, keySchema, throttle) {
    console.log("\nDeleteing Items from table " + tableName);
    var keys = [], lookupKey = {};
    for(var i = 0; i < keySchema.length; i++) {
        keys.push(keySchema[i].AttributeName);
        lookupKey[keySchema[i].AttributeName] = {};
    }

    ddb.scan({ TableName: tableName, ProjectionExpression: keys.join(",") }, function(err, data) {
        if(err)
            return console.error(err);

        var allTheKeys = [];
        async.eachOfSeries(data.Items, (item, index, done) => deleteItem(ddb, index, tableName, item, throttle, done), (err) => {
            if(err)
                console.error("Something didnt go well!", err, err.stack);
            else
                console.log("\nDone.");
        });
    });
}

function deleteItem(ddb, index, tableName, key, throttle, done) {
    ddb.deleteItem({TableName: tableName, Key: key, ReturnValues: "ALL_OLD"}, function(err, data) {
        if(err) done(err);

        setTimeout(done, throttle);

        switch(index % 4) {
            case 0:
                process.stdout.write('\b/');
                break;
            case 1:
                process.stdout.write('\b-');
                break;
            case 2:
                process.stdout.write('\b\\');
                break;
            case 3:
                process.stdout.write('\b.|');
                break;
        }

    });
}

function main() {
    var opts = getOpts(),
        ddb = new AWS.DynamoDB({ region: opts.region });

    var lcTable = opts.table.toLowerCase();
    if(lcTable.startsWith('vfs_') || protectedTables.indexOf(lcTable) > -1) {
        console.error("ERROR: That looks like a production table!\n -== I refuse to obey you! ==-");
        process.exit(1);
    }

    ddb.describeTable({ TableName: opts.table}, function(err, data) {
        if(err)
            return console.error("I cannot find that table.\nYou had better know what you are doing here.");

        console.log(`TableName: ${data.Table.TableName}`);
        console.log(`ItemCount: ${data.Table.ItemCount}`);
        console.log("------------------------------------------");

        cmdPrompt.get(prompt_schema, function(err, results) {
            if(err)
                return console.error(err);
            else if (results.verify.toLowerCase() === 'yes') {
                dumpTable(ddb, data.Table.TableName, data.Table.KeySchema, opts.throttle * 1000);
            } else
                return console.log("Abort!");
        });
    });
}
