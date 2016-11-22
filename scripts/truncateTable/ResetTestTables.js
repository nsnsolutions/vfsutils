#!/usr/bin/env node
'use strict';

const jobTable = 'test-DDBVFSJob-BRNXC6TQ3Z40';
const jobItemTable = 'test-DDBemailJobItem-EGEM533V40E3';
const supressionTable = 'test-DDBVFSSuppression-13RF5TLVLS5TX';
const userTable = 'test-DDBVFSUser-1N234NYBIBJG';
const testTable = 'alan_delete_test';

const execFile = require('child_process').execFile;
const ls = execFile('truncateTable', [testTable]);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
