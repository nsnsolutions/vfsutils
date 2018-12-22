 //VE2017090414031797f436b normal
 //known bookmark VI2017112822225040c9318e
 
// - 6 or 26 second delay
//- bookmark?
 
'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2'
const async = require('async');
const ArgumentParser = require('argparse').ArgumentParser;
//const packageJSON = require('../package.json');
const request = require('request');
var os = require('os');
 
function getOpts(){
	
	var ap = new ArgumentParser({
		//version: packageJSON.version,
		addHelp: true,
		//description: packageJSON.description
    });
	
/*	
	ap.addArgument(['CMDPKT'], {
		help: 'Path to command packet',
		type: String
	});
	
	ap.addArgument(['--stage'], {
		help: 'stack to run test against',
		type: String,
		defaultValue: 'test'
	});
	
	ap.addArgument([ '--region' ], {
        help: 'Override the region to connect to.',
        type: String,
        defaultValue: 'us-west-2'
    });
*/
		
	return ap.parseArgs();
} 
 

 function main(opt){
	
	var tasks = [
		getJobList,
		getDynamo
		
	];
	
	async.waterfall(tasks, (err, data) => {

		if(err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log(data);
		}
    });
	
//Gets the job list from s3
function getJobList(done){
	
			request({
			//url: "https://api.vfs.velma.com/v1/job?filterBy=jobId,EQ," + ,
			url: "https://s3-us-west-2.amazonaws.com/vfs-misc/blankemails/blank.txt",
			method: "GET",
			json: true,   // <--Very important!!!
			//body: defaultCmdPkt,
			headers: {
				"content-type": "application/json",
				"x-api-key":"HCYoWUGmcR2GOSvjk1Blva4psbWGj3Cj9DVUNNOn" //need to add ability to change api key per stage
			}
		}, function (error, response, body){
			opt.idArry = {response.body.split(/\r?\n/)};
				//console.log(response.body.split(/\r?\n/));
				console.log("got list");
				console.log("array set " + opt.idArry[3])
				
		});
		done();
	
}	
 
 /*connects to dynamo and gets 
	*/
	function getDynamo(done){
		console.log("got dynamo");
		console.log("array used: " + opt.idArry);
		for (var id in opt.idArry){
			console.log(id);
			var ddb = new AWS.DynamoDB({ region: AWS.config.region });
	
			var params = {
				TableName: "VFS_Job",
				Key: {
					jobId: {
						"S": id
					}//opt.cmdPktValues.requestJobId	
					
				}
				
			};
			ddb.getItem(params, function(err, data){
				if(err){
					console.log(err, err.stack);
				}else {
					if (data.Item.features.M){
						console.log("bookmark");
						
					}
					else{
					console.log(data.Item);			
					}		
				
					//done();
					
				}
				
			});

			//console.log(opt.dbValues);
			done();
			
		}
		
	}
 }
	
	
	main(getOpts());