#!/usr/bin/env node
'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const ArgumentParser = require('argparse').ArgumentParser;
const packageJSON = require('../package.json');

//list of tables not allowed 
const protectedTables = [
    'cb_analytics',
    'vfscallbackmap',
    'VFS_',
	'Beta_',
	'CDP_'
];

//not needed here
/* 
const testTables = [
	'Test_VFS_Approval',
	'Test_VFS_Assets',
	'Test_VFS_Client',
	'Test_VFS_Job',
	'Test_VFS_Product',
	'Test_VFS_Sponsor',
	'Test_VFS_Suppression',
	'Test_VFS_Tag',
	'Test_VFS_TagItem',
	'Test_VFS_User',
	'Test_VFS_Vendor'
];
*/


//Sets arguments 
function getOpts() {
    var ap = new ArgumentParser({
        version: packageJSON.version,
        addHelp: true,
        description: packageJSON.description
    });

    ap.addArgument([ 'TARGET' ], {
        help: 'The name of the table to update.',
        type: String
    });

    ap.addArgument([ '--region' ], {
        help: 'Override the region to connect to.',
        type: String,
        defaultValue: 'us-west-2'
    });

    ap.addArgument([ '--readcapacity' ], {
        help: 'Update the read capacity for all indexes on the new table.',
        type: Number,
        defaultValue: 5
    });

    ap.addArgument([ '--writecapacity' ], {
        help: 'Update the write capacity for all indexes on the new table.',
        type: Number,
        defaultValue: 5
    });
	
	ap.addArgument([ '--gsi' ], {
	help: 'The name of a secondary index to update.',
	type: Number,
	defaultValue: 5
    });

    return ap.parseArgs();
}


//main entry point - 
function main(opts) {
    var ddb = new AWS.DynamoDB({ region: opts.region });

    var tasks = [
        updateCapacity
       
    ];

    async.waterfall(tasks, (err, data) => {

        if(err) {
            console.error(err);
            process.exit(1);
        } else {
            console.log(data);
        }
    });

    function updateCapacity(done) {
		
		var params = {
				ProvisionedThroughput: {
				ReadCapacityUnits: opts.readcapacity, 
				WriteCapacityUnits: opts.writecapacity
				}, 
				GlobalSecondaryIndexUpdates : [
					{
						Update: {
							IndexName: opts.gsi, /* required */
							ProvisionedThroughput: { /* required */
								ReadCapacityUnits: opts.readcapacity, /* required */
								WriteCapacityUnits: opts.writecapacity /* required */
							}
					  }
						
					}
					
				],
				TableName: opts.TARGET
			};
			
        //console.log(params.GlobalSecondaryIndexUpdates);

        ddb.updateTable(params, (err, data) => {
            if(err) {
              console.log(err);
              process.exit(1);
            }else {
              console.log(data);
            }

        }); 
    }

  

}

main(getOpts());
