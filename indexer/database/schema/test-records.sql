CREATE TABLE IF NOT EXISTS account_chain_1__1
    PARTITION OF account FOR VALUES IN ('chain_1-1');
CREATE TABLE IF NOT EXISTS recent_accounts_transaction_chain_1__1
    PARTITION OF recent_accounts_transaction FOR VALUES IN ('chain_1-1');
CREATE TABLE IF NOT EXISTS ref_account_to_recent_tx_chain_1__1
    PARTITION OF ref_account_to_recent_tx FOR VALUES IN ('chain_1-1');

INSERT INTO account (chain_id, bech32_address) VALUES
    ('chain_1-1', 'addr-1'),
    ('chain_1-1', 'addr-2');

INSERT INTO recent_accounts_transaction (chain_id, height, hash, epoch, message_types) VALUES
    ('chain_1-1', 1, 'hash-1', 1, ARRAY['type-1', 'type-2']),
    ('chain_1-1', 1, 'hash-2', 1, ARRAY['type-1', 'type-2', 'type-3']);

INSERT INTO ref_account_to_recent_tx (chain_id, bech32_address, height, hash) VALUES
    ('chain_1-1', 'addr-1', 1, 'hash-1'),
    ('chain_1-1', 'addr-1', 1, 'hash-2'),
    ('chain_1-1', 'addr-2', 1, 'hash-1');