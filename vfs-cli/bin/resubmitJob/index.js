'use strict';

module.exports = {
    name: "job-resubmit",
    description: "Resubmit a VFS Job.",
    exec: require('./exec'),
    register: (ap) => {
        ap.addArgument(
            [ 'JOBID' ],
            {
                help: "A VFS JobId.",
                type: String
            }
        );

        ap.addArgument(
            [ '-k','--api-key' ],
            {
                help: "The API key used to resubmit the job.",
                type: String,
                defaultValue: process.env['VFSAPIKEY']
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
