-- table chain_info
CREATE TABLE chain_info (
    chain_id            TEXT    NOT NULL,
    "name"              TEXT    NOT NULL,
    chain_type          TEXT    NOT NULL,
    bech32              JSONB   NOT NULL,
    denoms              JSONB   NOT NULL,
    be_json_rpc_urls    TEXT[], -- sorted, the best one is the first, might be empty

    CONSTRAINT chain_info_pkey PRIMARY KEY (chain_id),
    CONSTRAINT chain_info_unique_chain_name UNIQUE ("name") -- chain name must be unique
);

-- table account
-- Page: search multi-chain accounts, search single-chain, showing account details
CREATE TABLE account (
    chain_id                        TEXT        NOT NULL,           -- also used as partition key
    bech32_address                  TEXT        NOT NULL,           -- normalized: lowercase
    erc20_balance_contracts         TEXT[]      NOT NULL,           -- contracts that the account has erc20 balance

    -- inc by one per record inserted to `recent_account_transaction`, upon reaching 200, prune the oldest txs and reset
    continous_insert_cur_tx_counter SMALLINT    NOT NULL DEFAULT 0,

    CONSTRAINT account_pkey PRIMARY KEY (chain_id, bech32_address)
) PARTITION BY LIST(chain_id);
-- index for lookup account by bech32 address, multi-chain
CREATE INDEX account_b32_addr_index ON account (bech32_address);

-- table recent_account_transaction
-- This table keeps the most recent transactions of each account, data can be permanent or temporary:
-- - Permanent: the tx is kept forever due to account not having new tx.
-- - Temporary: when new txs are inserted, the oldest txs are pruned.
CREATE TABLE recent_account_transaction (
    -- main columns
    chain_id            TEXT    NOT NULL,
    bech32_address      TEXT    NOT NULL, -- normalized: lowercase
    height              BIGINT  NOT NULL,
    hash                TEXT    NOT NULL,

    -- view-only columns
    epoch               BIGINT  NOT NULL, -- epoch UTC seconds
    message_types       TEXT[]  NOT NULL, -- proto message types of inner messages

    -- category columns
    erc20               BOOL    NOT NULL DEFAULT FALSE, -- whether the transaction involves erc20 token transfer
    nft                 BOOL    NOT NULL DEFAULT FALSE, -- whether the transaction involves nft token transfer

    CONSTRAINT recent_account_transaction_pkey PRIMARY KEY (chain_id, bech32_address),
    CONSTRAINT recent_account_transaction_to_account_fkey FOREIGN KEY (chain_id, bech32_address) REFERENCES account (chain_id, bech32_address)
);
-- Number of txs per account is not much, a few hundreds at most,
-- so no need to having further index for listing ERC-20 and NFT txs

-- table transaction
-- Page: search multi-chain transactions, search single-chain, showing blocks & transactions list
CREATE TABLE transaction (
    -- pk fields
    chain_id            TEXT    NOT NULL,
    height              BIGINT  NOT NULL,
    hash                TEXT    NOT NULL, -- normalized: Cosmos: uppercase without 0x, Ethereum: lowercase with 0x
    partition_id        BIGINT  NOT NULL, -- week id = FLOOR(epoch UTC seconds / (3600 sec x 24 hours x 7 days))

    -- other fields
    epoch               BIGINT  NOT NULL, -- epoch UTC seconds
    message_types       TEXT[]  NOT NULL, -- proto message types of inner messages
    tx_type             TEXT    NOT NULL, -- tx type, eg: cosmos or evm

    CONSTRAINT transaction_pkey PRIMARY KEY (chain_id, height, hash, partition_id)
) PARTITION BY LIST(partition_id);
-- index for lookup transaction by hash, multi-chain & single-chain
CREATE INDEX transaction_hash_index ON transaction(hash);