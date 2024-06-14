# Dymension RollApps Block Explorer
## _aka Dr.BE_

This repository contains 2 applications:
- [On-chain data indexer](https://github.com/bcdevtools/dymension-rollapp-block-explorer/tree/main/indexer)
- [Frontend Web Application](https://github.com/bcdevtools/dymension-rollapp-block-explorer/tree/main/web-app)

### I. On-chain data indexer

Responsibility to crawling on-chain data from RollApps and indexes the data into PostgreSQL database.

### II. Frontend Web Application

Provide Block Explorer web interface for user exploring multiple-Dymensional RollApps.

## Limitation

Due to huge number of RollApps [(~15k)](https://fl.dym.fyi/rollapps) as we can see on the Devnet Froopyland,
that leading to huge number of hardware required to store the entire data, so we need to limit something.
We have put a limitation on number of historical data per RollApp,
which can be unlocked by paying `Dr.BE` _(ibc/5620289B0E1106C8A2421F212FEC4EB19E3CBA964662DB61754CCDE8FAAC29FF)_ token to the Block Explorer operator, on Dymension Hub.

| Feature                         | Free-tier | Unlock 1 | Unlock 2 | Unlock 3 |
|---------------------------------|-----------|----------|----------|----------|
| Recent transactions per account | 50        | ?        | ?        | ?        |
| Transaction lookup by hash      | 1-2 weeks | ?        | ?        | ?        |
