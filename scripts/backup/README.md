## Deps
Install the AWS sdk.

```
npm install aws-sdk
```

## To backup
Modify backup.js to set the TableName to be backed up.

```
node ./backup.js > backup.json
```

## To Restore.
Moodify restore.js to set the TableName to be restored.

```
node ./restore.js
```
