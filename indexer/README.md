## Dymension RollApp Block Explorer Indexer

This is the indexer for the Dymension RollApp Block Explorer.

It is responsible for indexing the RollApps and storing the data in a database.

## Installation

```bash
# Install binary
# Require go 1.18+
make install

# Init configuration files
beid init

# Setup database
cd ./database/schema
./init-local.sh
```

## Indexing data

1. Configure the indexer and connection to database by editing the `~/.beid/config.yaml` file.
2. Setting the RollApps list by editing the `~/.beid/chains.yaml` file.
3. Verify the configuration by running the following command:
   > beid check
4. Start the indexer by running the following command:
   > beid start