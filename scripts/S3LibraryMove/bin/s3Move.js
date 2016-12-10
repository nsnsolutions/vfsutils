#!/usr/bin/env node
'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2'
const async = require('async');
const ArgumentParser = require('argparse').ArgumentParser;
const packageJSON = require('../package.json');
const request = require('request');
const sleep = require('sleep');



function getOpts(){
	
	var ap = new ArgumentParser({
		version: packageJSON.version,
		addHelp: true,
		description: packageJSON.description
    });
	
	/* ap.addArgument(['CMDPKT'], {
		help: 'Path to command packet',
		type: String
	}); */

		
	return ap.parseArgs();
}

function main(opt){
	
	var tasks = [
		getS3dirs 
		
	];
	
	async.waterfall(tasks, (err, data) => {

		if(err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log(data);
		}
    });
	
	
	/*
		tables: vfs_product and vfs-product-test
		
		contact s3/velma-fulfillment/library/product and iterate through all vfs_product sub directories 
		-copy all directories to vfs_library (dev, prod, test)
		- for each sub dir get the path for 
			-template
			-preview
			-thumb
		
		this info will be used to updated the related vfs tables with the new path
		-also update the item id with the prod id
	*/	
	function getS3dirs(){
		
		var s3 = new AWS.S3();
		
		/* var params = {
			Bucket: 'vfs-library',
			Key: 'test/1000/'
		}
		
		s3.getObject(params, function(err, data){
			if(err) console.log(err, err.stack);
			else console.log(data.Body);
			
		}); */
		
		var params = {
			Bucket: 'vfs-library',
			Marker: 'test'
			
		}
		
		s3.listObjects(params, function(err, data){
			if(err) console.log(err, err.stack);
			else console.log(data);
			
		});
		
	}
		
		

}

main(getOpts());