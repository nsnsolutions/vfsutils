'use strict';

const Client = require('node-rest-client').Client;
const aws = require('aws-sdk');
const async = require('async');
const config = require('./package.json').config
const ddbClient = new aws.DynamoDB.DocumentClient({ region: config.region });
const s3 = new aws.S3({ region: config.region });
const client = new Client();
const rpcCreateAsset = `https://${config.rpc}/amqp/exec/assetService/createAssetByUrl?version=v1`;
const rpcDeleteAsset = `https://${config.rpc}/amqp/exec/assetService/deleteAsset?version=v1`;

const tasks = [
    loadProducts,
    transformProducts,
    deleteAsset,
    createAsset,
    buildDeletes,
    buildUpdates,
    commit
];

var state = {
    toDeleteFromDynamo: [],
    lookup: {},
    updateParams: []
};

async.waterfall(tasks, (err, data) => {

    if(err)
        return console.error("ERROR: ", err);

    console.info("Success!");
    if(data)
        console.dir(data)
});


function loadProducts(done) {
    console.log("Loading products from: " + config.productTable);
    ddbClient.scan({ TableName: config.productTable }, (err, data) => {
        state.products = data.Items;
        done(err);
    });
}

function transformProducts(done) {
    console.log("Transforming product ids...");
    async.each(state.products, (item, next) => {
        if(item.id !== item.productId) {
            state.toDeleteFromDynamo.push(item.id);
            item.id = item.productId;
        } else {
            console.info("Transformation skipped. Product ID already set: " + item.id);
        }

        state.lookup[item.id] = item;
        next();
    }, done);
}

function deleteAsset(done) {
    console.log("Removing any existing asset refrences. Failures are silenced and ignored.");
    async.each(state.products, (item, next) => {
        var params = {
            headers: {
                'X-Repr-Format': 'RPC',
                'Content-Type': 'application/json'
            },
            data: {
                productId: item.id,
                assetName: 'template'
            }
        };

        client.post(rpcDeleteAsset, params, (data, resp) => next());
    }, done);
}

function createAsset(done) {
    console.log("Inserting template assets for each product...");
    async.each(state.products, (item, next) => {
        var params = {
            headers: {
                'X-Repr-Format': 'RPC',
                'Content-Type': 'application/json'
            },
            data: {
                productId: item.id,
                assetName: 'template',
                url: item.template,
                createThumb: false,
                createPreview: false
            }
        };

        client.post(rpcCreateAsset, params, (data, resp) => {
            if(data.hasError === false) {
                console.log("Asset created for product: " + item.id);
                item.template = data.result.link + "?versionId=" + data.result.versionId;
                next();
            } else {
                next({
                    name: "Error",
                    message: "Failed to create asset.",
                    innerError: data && data.message && data.message || data.toString()
                });
            }
        });
    }, done);
}

function buildDeletes(done) {
    async.each(state.toDeleteFromDynamo, (item, next) => {
        console.log("Building delete statement for old index: " + item);
        state.updateParams.push({ DeleteRequest: { Key: { id: item } } });
        next();
    }, done);
}

function buildUpdates(done) {
    async.each(state.products, (item, next) => {
        console.log("Building updates for product: " + item.id);
        state.updateParams.push({ PutRequest: { Item: item } });
        next();
    }, done);
}

function commit(done) {
    console.log("Commiting changes...");
    var params = { RequestItems: {} };
    params.RequestItems[config.productTable] = state.updateParams;
    ddbClient.batchWrite(params, done);
}
