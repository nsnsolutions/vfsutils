# Truncate Table

Truncate a table that matches the description of an existing table.

## Install

Clone this repository
Change to the truncateTable project directory
Link the script into your bin path

```
git clone git@github.com:nsnsolutions/vfsutils.git
cd vfsutils/scripts/truncateTable
npm link
truncateTable --help
```

## Usage

To delete a source_tablename and create a target_tablename

```
truncateTable source_tablename target_tablename --region us-west-2 --read-capacity 5 --write-capacity 5
```
To see all options, run `truncateTable --help`

source_tablename and target_tablename arguements are the only ones required

Optional arguement default values
--region us-west-2
--read-capacity 5
--write-capacity 5

## Install

- Clone this repository
- Change to the truncateTable project directory
- Link the script into your bin path
