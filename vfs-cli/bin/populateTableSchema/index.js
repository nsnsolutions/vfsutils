'use strict';

module.exports = {
    name: "populateTableSchema",
    description: "Obtain and place DynamoDB table description into Redis.",
    exec: require('./exec'),
    register: (ap) => {

        ap.addArgument(
            [ 'TABLE' ], {
                help: "The name of the DynamoDB table to process. Use '*' for all tables.",
                nargs: "*",
                type: String
        });

        ap.addArgument(
            [ '--redis-uri' ], {
            help: "A url pointing to the redis instance and database.",
            type: String,
            required: true
        });

        ap.addArgument(
            [ '-r','--region' ], {
                help: "The AWS Region used to connect.",
                type: String,
                defaultValue: 'us-west-2'
        });
    }
};
