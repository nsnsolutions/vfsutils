# Purge Table

This script can be used to delete and rebuild a dynamo table.

## Install

- Clone this repository
- Change to the truncateTable project directory
- Link the script into your bin path

```bash
git clone git@github.com:nsnsolutions/vfsutils.git
cd vfsutils/scripts/truncateTable
npm link
truncateTable --help
```

## Usage

To dump all data from a table, run truncateTable with the tablename to empty.

```bash
truncateTable TABLENAME
```

To see all options, run `truncateTable --help`

