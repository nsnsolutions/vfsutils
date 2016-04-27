

var aws = require('aws-sdk');
var fs = require('fs');

aws.config.update({ region: "us-west-2" });

var DB_MAP = [
	"VFS_Sponsor",
	"VFS_Client",
	"VFS_Product", 
	"cb_analytics",
	"VFS_EmailJobItem",
	"VFS_EmailJobItemEvent",
	"VFS_Job",
	"VFS_Lte_Catalog",
	"VFS_ServiceStatus",
	"VFS_Suppression",
	"VFS_User",
	"vfsCallbackMap",
	"emailJobItem",
	"emailJobItemEvent",
	"job",
	"job_old",
	"sponsor", 
	"client"
];

var sourceDir = '';
if (process.argv)
	sourceDir = process.argv[2];

console.log("sourceDir: " + sourceDir);

var doc = new aws.DynamoDB.DocumentClient();

DB_MAP.forEach(function (tableName) {

	var params = {
	    "TableName": tableName
	};

	// console.log("Backing Up: " + tableName);
	doc.scan(params, function(err, data) {
	    if(err) {
	        console.log(err);
	    } else {
	    	var file = sourceDir + "\\" + tableName + ".json";
	    	console.log("Backing Up: " + tableName + " --> " + file);
	    	fs.writeFile(file, JSON.stringify(data.Items));
	    }
	});
});