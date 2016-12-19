#!/usr/bin/env node
'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2'
const async = require('async');
const ArgumentParser = require('argparse').ArgumentParser;
const packageJSON = require('../package.json');
const request = require('request');
const filesToGet = ['/thumb.jpg','/template.html','/preview.jpg'];



function getOpts(){
	
	var ap = new ArgumentParser({
		version: packageJSON.version,
		addHelp: true,
		description: packageJSON.description
    });
	
	ap.addArgument(['--ptable'], {
		help: 'name of product table to pull data from',
		type: String,
		defaultValue: 'TEST_VFS_Product'
	});
	
	ap.addArgument(['--bktsubdir'], {
		help: 'name of bucket subdirectory productid directories are stored in',
		type: String,
		defaultValue: 'test'
	})

		
	return ap.parseArgs();
}

function main(opt){
	
	var tasks = [
		getDynamoProdInfo,
		getS3Dirs
		
		
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
		library.velma.com/test library.velma.com/prod library.velma.com/dev
	*/	
	
	//this gets the objects from the dynamo product table
	function getDynamoProdInfo(done){
		opt.productIdArry = [];
		var ddb = new AWS.DynamoDB({ region: 'us-west-2' });
		
		var params = {
			TableName: opt.ptable
		
			
		};
		ddb.scan(params, function(err, data){
			if(err){
				console.log(err, err.stack);
			}else {
				//console.log(data.Items[0].id);
				opt.products = data.Items;
				
				//console.log(opt.products);
				for(var product in data.Items){
					var idToInt = parseInt();
					//console.log(data.Items[product].productId.S);
					//create array of product ids and exclude any that are not 1000 series
					if(data.Items[product].productId.S.includes("10") ){ 
						opt.productIdArry.push(data.Items[product].productId.S);
					
					}
					
					
				}
				//console.log(opt.productIdArry);
				
				
			}
			
		});
		done();
	}
	
//this will get a list of objects in a specific s3 directory
function getS3Dirs(done){
	
	var s3 = new AWS.S3();
		
	//needs to be restricted by highest number
	for(var count = 1001; count < 1006; count++){
		for (var file in filesToGet){
			
			var key = count.toString();
			var params = {
				Bucket: 'vfs-library'
				,Key: opt.bktsubdir + '/' + key + filesToGet[file]
				//,Key: 'test/1006/thumb.jpg'
				
			}
			//console.log(params);

			s3.getObject(params, function(err, data){
				if(err) console.log(err, err.stack);
				else{
					//console.log(data);
					//old path https://fs.velma.com/library/product/1005/thumb.jpg?versionId=wFSbEdich0b0s0EwiWUtFer.Hz27DvrV
					//new path https://as.velma.com/vfs_library/1005/thumb.jpg?versionId=wFSbEdich0b0s0EwiWUtFer.Hz27DvrV
					var shortFileToGet = filesToGet[file].replace("test/","");
					console.log(filesToGet[file]);
					if (filesToGet[file].includes("thumb")){
						var newThumbPath = "https://as.velma.com/vfs_library" + shortFileToGet + "?versionId=" + data.VersionId;
						console.log(newThumbPath);
					}
					if (filesToGet[file].includes("preview")){
						var newPreviewPath = "https://as.velma.com/vfs_library" + shortFileToGet + "?versionId=" + data.VersionId;
						//console.log(newPreviewPath);
					}
					if (filesToGet[file].includes("template")){
						var newTemplatePath = "https://as.velma.com/vfs_library" + shortFileToGet + "?versionId=" + data.VersionId;
						//console.log(newTemplatePath);
					}
					
					for(var product in opt.products){
						
						if(opt.products[product].productId.S == key){
							var productPaths = [{
								id : opt.products[product].id.S,
								productId: opt.products[product].productId.S,
								thumb: newThumbPath,
								preview: newPreviewPath,
								template: newTemplatePath
								
								
								
							}];
 
							//console.log(productPaths);
							
						}
						
					}
					
				
				} 
				
				
			});
			
		}

	}
	 done();
	
}
	
	
	
	
	

		
		

}


main(getOpts());