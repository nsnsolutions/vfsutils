'use strict';

module.exports = {
    name: "loadTable",
    description: "Fill the given table with the data provided",
    exec: require('./exec'),
    register: (ap) => {
        ap.addArgument(
            [ 'SOURCE' ],
            {
                help: "A path to the file or url containing the data to import. Use '-' for STDIN.",
                type: String
            }
        );

        ap.addArgument(
            [ 'TARGET' ],
            {
                help: "Specify the DynamoDB Table to write the data.",
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
