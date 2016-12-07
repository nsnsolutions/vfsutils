# Purge Table

This script can be used to empty a dynamo table.

## Install

Clone this repository
Change to the dynamo-purge project directory
Link the script into your bin path

```bash
git clone git@github.com:nsnsolutions/vfsutils.git
cd vfsutils/scripts/dynamo_purge
npm link
dynamoPurge --help
```

## Usage

To dump all data from a table, run dynamoPurge with the tablename to empty.

```bash
dynamoPurge TABLENAME
```

To see all options, run `dynamoPurge --help`