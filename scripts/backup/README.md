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
Modify restore.js to set the TableName to be restored.

```
node ./restore.js
```

## To backup all
Modify backupAll.js and add tablenames to DB_MAP

```
node backupAll.js c:\VFS\DynamoDB\Backups

