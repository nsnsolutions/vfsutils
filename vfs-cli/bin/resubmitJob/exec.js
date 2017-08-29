'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const httpreq = require('httpreq');

module.exports = function resubmitJob(opts, console, done) {

    var s3 = new AWS.S3({ region: opts.region });
    var db = new AWS.DynamoDB.DocumentClient({ region: opts.region });

    var params = {
        TableName: "VFS_Job",
        Key: { jobId: opts.JOBID }
    };

    db.get(params, (e, d) => {

        if(!opts.force && d.Item.status.toLowerCase() !== 'Failed')
            return done(new Error("Job is not failed. If you really want to do this, use --force."));

        var params = {
            Bucket: 'vfs-job',
            Key: `prod/${opts.JOBID}/${opts.JOBID}Original.json`
        };

        s3.getObject(params, (e, d) => {
            if(e) return done(e);
            d.Body
            httpreq.post('https://api.vfs.velma.com/v1/job', {
                body: d.Body.toString(),
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Api-Key': opts.api_key
                }
            }, (e,d) => {
                if(e) return done(e);
                console.info(d.body);
                return done()
            })
        })
    });
}
