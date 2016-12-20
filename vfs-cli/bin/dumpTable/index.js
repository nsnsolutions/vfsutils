'use strict';

module.exports = {
    name: "dumpTable",
    description: "Extract all data from the given DynamoDB table and write it to the given file.",
    exec: require('./exec'),
    register: (ap) => {
        ap.addArgument(
            [ 'SOURCE' ],
            {
                help: "The name of the DynamoDB table from which to extract data.",
                type: String
            }
        );

        ap.addArgument(
            [ 'TARGET' ],
            {
                help: "Specify a path to an output file to write the extracted data. Use '-' for STDOUT.",
                type: String
            }
        );

        ap.addArgument(
            [ '-r','--region' ],
            {
                help: "The AWS Region used to connect.",
                type: String,
                defaultValue: 'us-west-2'
            }
        );
    }
};
