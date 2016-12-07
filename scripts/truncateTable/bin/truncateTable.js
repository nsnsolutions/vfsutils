#!/usr/bin/env node
'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const ArgumentParser = require('argparse').ArgumentParser;
const packageJSON = require('../package.json');
const sleep = require('sleep');

const protectedTables = [
    'cb_analytics',
    'vfscallbackmap',
    'VFS_'
];

function getOpts() {
    var ap = new ArgumentParser({
        version: packageJSON.version,
        addHelp: true,
        description: packageJSON.description
    });

    ap.addArgument([ 'SOURCE' ], {
        help: 'The name of the table to delete.',
        type: String
    });


    ap.addArgument([ 'TARGET' ], {
        help: 'The name of the table to create.',
        type: String
    });

    ap.addArgument([ '--region' ], {
        help: 'Override the region to connect to.',
        type: String,
        defaultValue: 'us-west-2'
    });

    ap.addArgument([ '--read-capacity' ], {
        help: 'Override the read capacity for all indexes on the new table.',
        type: Number,
        defaultValue: 5
    });

    ap.addArgument([ '--write-capacity' ], {
        help: 'Override the write capacity for all indexes on the new table.',
        type: Number,
        defaultValue: 5
    });

    return ap.parseArgs();
}

function main(opts) {
    var ddb = new AWS.DynamoDB({ region: opts.region });

    var tasks = [
        loadTableDescription,
        createNewTableDescription,
		    deleteTable,
        createNewTable
    ];

    async.waterfall(tasks, (err, data) => {

        if(err) {
            console.error(err);
            process.exit(1);
        } else {
            console.log(data);
        }
    });

    function loadTableDescription(done) {
        console.log("Loading table description: " + opts.SOURCE);

        ddb.describeTable({ TableName: opts.SOURCE }, (err, data) => {
            if(err) {
              console.log("Couldn't load table description");
              process.exit(1);
            }else {
              opts.sourceDescription = data.Table;
              done(err);
            }

        });
    }

    function createNewTableDescription(done) {
        console.log("Creating new table description");

        opts.targetDescription = {
            TableName: opts.TARGET,
            AttributeDefinitions: opts.sourceDescription.AttributeDefinitions,
            KeySchema: opts.sourceDescription.KeySchema,
            ProvisionedThroughput: {
                ReadCapacityUnits: opts.read_capacity || opts.sourceDescription.ProvisionedThroughput.ReadCapacityUnits,
                WriteCapacityUnits: opts.write_capacity || opts.sourceDescription.ProvisionedThroughput.WriteCapacityUnits,
            }
        };

        if('GlobalSecondaryIndexes' in opts.sourceDescription) {

            opts.targetDescription.GlobalSecondaryIndexes = [];

            for(var i = 0; i < opts.sourceDescription.GlobalSecondaryIndexes.length; i++) {
                var gsi = opts.sourceDescription.GlobalSecondaryIndexes[i];
                opts.targetDescription.GlobalSecondaryIndexes.push({
                    IndexName: gsi.IndexName,
                    KeySchema: gsi.KeySchema,
                    Projection: gsi.Projection,
                    ProvisionedThroughput: {
                        ReadCapacityUnits: opts.read_capacity || gsi.ProvisionedThroughput.ReadCapacityUnits,
                        WriteCapacityUnits: opts.write_capacity || gsi.ProvisionedThroughput.WriteCapacityUnits
                    }
                });
            }
        }

        if('LocalSecondaryIndexes' in opts.sourceDescription) {

            opts.targetDescription.LocalSecondaryIndexes = [];

            for(var i = 0; i < opts.sourceDescription.LocalSecondaryIndexes.length; i++) {
                var lsi = opts.sourceDescription.LocalSecondaryIndexes[i];
                opts.targetDescription.LocalSecondaryIndexes.push({
                    IndexName: lsi.IndexName,
                    KeySchema: lsi.KeySchema,
                    Projection: lsi.Projection    //, MOVED TO HANDLE TABLES WITHOUT LocalSecondaryIndexes.ProvisionedThroughput
                    /*ProvisionedThroughput: {
                        ReadCapacityUnits: opts.read_capacity || lsi.ProvisionedThroughput.ReadCapacityUnits,
                        WriteCapacityUnits: opts.write_capacity || lsi.ProvisionedThroughput.WriteCapacityUnits
                    }*/
                });
                if('LocalSecondaryIndexes.ProvisionedThroughput' in opts.sourceDescription){
                  opts.targetDescription.LocalSecondaryIndexes.push({
                    ProvisionedThroughput: {
                        ReadCapacityUnits: opts.read_capacity || lsi.ProvisionedThroughput.ReadCapacityUnits,
                        WriteCapacityUnits: opts.write_capacity || lsi.ProvisionedThroughput.WriteCapacityUnits
                    }
                  });

                }
            }
        }

        done();
    }

    function createNewTable(done) {
        console.log("Creating new table: " + opts.TARGET);

        ddb.createTable(opts.targetDescription, (err, data) => {
            if(err) return done(err);
            done(null,"Completed Successfully!");
        });
    }

		function deleteTable(done) {
      //USED TO PROTECT PROD TABLES
      var lcTable =getOpts().SOURCE.toLowerCase();

      if(lcTable.startsWith('vfs') || protectedTables.indexOf(lcTable) > -1) {
        console.error("ERROR: " + lcTable + " looks like a production table!\n -== I refuse to obey you! ==-");
        process.exit(1);
      }

  		console.log("Deleting " + getOpts().SOURCE);

  		var params = {
  			TableName: getOpts().SOURCE
  		};

		ddb.deleteTable(params, (err, data) => {
      if(err) return done(err);

      //NEED TO WAIT FOR DYNOMO TO FINISH DELETING - INCASE DELETE TABLE NAME AND CREATE TABLE NAME ARE THE SAME
			sleep.sleep(30);
      done();
        });
	}
}

main(getOpts());
