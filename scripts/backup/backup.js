var TABLENAME = "VFS_Product";

var aws = require('aws-sdk');
aws.config.update({ region: "us-west-2" });

var doc = new aws.DynamoDB.DocumentClient();

var params = {
    "TableName": TABLENAME
};

doc.scan(params, function(err, data) {
    if(err) {
        console.log(err);
    } else {
        console.log(JSON.stringify(data.Items));
    }
});
