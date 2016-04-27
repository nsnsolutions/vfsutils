var TABLENAME = "VFS_Product";

var aws = require('aws-sdk');

aws.config.update({ region: "us-west-2" });
var doc = new aws.DynamoDB.DocumentClient();

const fs = require('fs');
fs.readFile('backup.json', 'utf-8', function(err, data) {
    var _data = JSON.parse(data);

    _data.forEach(function(datum) {
        doc.put({
            TableName: TABLENAME,
            Item: datum
        }, function(err, data) {
            if(err){
                console.log("Oh shit!");
            }
        });
    });
});

