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

    -- inc by one per record inserted to `ref_account_to_recent_tx`,
    -- upon reaching specific number, prune the oldest ref and reset
    continous_insert_ref_cur_tx_counter SMALLINT    NOT NULL DEFAULT 0,

    CONSTRAINT account_pkey PRIMARY KEY (chain_id, bech32_address)
) PARTITION BY LIST(chain_id);
-- index for lookup account by bech32 address, multi-chain
CREATE INDEX account_b32_addr_index ON account (bech32_address);

-- table account_erc20_balance
-- Used for marking account has ERC-20/CW-20 balance, for listing balances
CREATE TABLE account_erc20_balance (
    chain_id                        TEXT        NOT NULL,           -- also used as partition key
    bech32_address                  TEXT        NOT NULL,           -- normalized: lowercase
    contract_address                TEXT        NOT NULL,           -- normalized: lowercase

     CONSTRAINT account_erc20_balance_pkey PRIMARY KEY (chain_id, bech32_address, contract_address),
    CONSTRAINT erc20_balance_to_account_fkey FOREIGN KEY (chain_id, bech32_address) REFERENCES account(chain_id, bech32_address)
) PARTITION BY LIST(chain_id);

-- table account_nft_balance
-- Used for marking account has NFT balance, for listing balances
CREATE TABLE account_nft_balance (
    chain_id                        TEXT        NOT NULL,           -- also used as partition key
    bech32_address                  TEXT        NOT NULL,           -- normalized: lowercase
    contract_address                TEXT        NOT NULL,           -- normalized: lowercase

    CONSTRAINT account_nft_balance_pkey PRIMARY KEY (chain_id, bech32_address, contract_address),
    CONSTRAINT nft_balance_to_account_fkey FOREIGN KEY (chain_id, bech32_address) REFERENCES account(chain_id, bech32_address)
) PARTITION BY LIST(chain_id);

-- table recent_accounts_transaction
CREATE TABLE recent_accounts_transaction (
    -- main columns
    chain_id            TEXT        NOT NULL,   -- also used as partition key
    height              BIGINT      NOT NULL,
    hash                TEXT        NOT NULL,
    ref_count           SMALLINT    NOT NULL DEFAULT 0, -- number of references to this tx when reduced to zero, delete the tx.

    -- view-only columns
    epoch               BIGINT      NOT NULL, -- epoch UTC seconds
    message_types       TEXT[]      NOT NULL, -- proto message types of inner messages

    CONSTRAINT recent_accounts_transaction_pkey PRIMARY KEY (chain_id, height, hash)
) PARTITION BY LIST(chain_id);

-- table ref_account_to_recent_tx
CREATE TABLE ref_account_to_recent_tx (
    chain_id        TEXT    NOT NULL,   -- also used as partition key
    bech32_address  TEXT    NOT NULL,   -- normalized: lowercase
    height          BIGINT  NOT NULL,
    hash            TEXT    NOT NULL,

    CONSTRAINT ref_account_to_recent_tx_pkey PRIMARY KEY (chain_id, bech32_address, height, hash),
    CONSTRAINT ref_recent_acc_tx_to_account_fkey FOREIGN KEY (chain_id, bech32_address)
        REFERENCES account(chain_id, bech32_address),
    CONSTRAINT ref_recent_acc_tx_to_recent_tx_fkey FOREIGN KEY (chain_id, height, hash)
        REFERENCES recent_accounts_transaction(chain_id, height, hash)
) PARTITION BY LIST(chain_id);
-- index for lookup recent tx by account, as well as for pruning
CREATE INDEX ref_account_to_recent_tx_by_account_index ON ref_account_to_recent_tx(chain_id, bech32_address);
-- trigger functions for updating reference to tables account and recent_accounts_transaction
CREATE OR REPLACE FUNCTION func_trigger_after_insert_ref_account_to_recent_tx() RETURNS TRIGGER AS $$
BEGIN
    -- increase reference count to account
    UPDATE account SET continous_insert_ref_cur_tx_counter = continous_insert_ref_cur_tx_counter + 1
    WHERE chain_id = NEW.chain_id AND bech32_address = NEW.bech32_address;

    -- increase reference count to recent_accounts_transaction
    UPDATE recent_accounts_transaction SET ref_count = ref_count + 1
    WHERE chain_id = NEW.chain_id AND height = NEW.height AND hash = NEW.hash;

    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_after_insert_ref_account_to_recent_tx
    AFTER INSERT ON ref_account_to_recent_tx
    FOR EACH ROW EXECUTE FUNCTION func_trigger_after_insert_ref_account_to_recent_tx();
-- trigger functions for pruning recent_accounts_transaction
CREATE OR REPLACE FUNCTION func_trigger_after_delete_ref_account_to_recent_tx() RETURNS TRIGGER AS $$
DECLARE
    later_ref_count SMALLINT;
BEGIN
    -- reduce reference count
    UPDATE recent_accounts_transaction SET ref_count = ref_count - 1
    WHERE chain_id = OLD.chain_id AND height = OLD.height AND hash = OLD.hash;

    -- delete the tx if ref_count is zero
    SELECT COALESCE(rat.ref_count, 0) INTO later_ref_count FROM recent_accounts_transaction rat
    WHERE rat.chain_id = OLD.chain_id AND rat.height = OLD.height AND rat.hash = OLD.hash;
    IF later_ref_count < 1 THEN
        DELETE FROM recent_accounts_transaction
        WHERE chain_id = OLD.chain_id AND height = OLD.height AND hash = OLD.hash;
    END IF;

    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_after_delete_ref_account_to_recent_tx
    AFTER DELETE ON ref_account_to_recent_tx
    FOR EACH ROW EXECUTE FUNCTION func_trigger_after_delete_ref_account_to_recent_tx();

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
