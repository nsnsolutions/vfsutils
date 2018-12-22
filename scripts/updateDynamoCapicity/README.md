# Update capacity

Updates the write and read capacity of a given dynamo table

## Install

Clone this repository
Change to the updateCapacity project directory
Link the script into your bin path

```
git clone git@github.com:nsnsolutions/vfsutils.git
cd vfsutils/scripts/updateCapacity
npm link
updateCapacity --help
```

## Usage

To update a tables read and or write capacity

```
updateCapacity source_tablename target_tablename --region us-west-2 --read-capacity 5 --write-capacity 5
```
To see all options, run `updateCapacity --help`

 target_tablename arguements is the only one required

Optional arguement default values
--region us-west-2
--read-capacity 5
--write-capacity 5


