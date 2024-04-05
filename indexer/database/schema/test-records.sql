CREATE TABLE IF NOT EXISTS account_chain_1__1
    PARTITION OF account FOR VALUES IN ('chain_1-1');
CREATE TABLE IF NOT EXISTS recent_accounts_transaction_chain_1__1
    PARTITION OF recent_accounts_transaction FOR VALUES IN ('chain_1-1');
CREATE TABLE IF NOT EXISTS ref_account_to_recent_tx_chain_1__1
    PARTITION OF ref_account_to_recent_tx FOR VALUES IN ('chain_1-1');

INSERT INTO account (chain_id, bech32_address) VALUES
    ('chain_1-1', 'addr-1'),
    ('chain_1-1', 'addr-2');

UPDATE account SET balance_on_erc20_contracts = balance_on_erc20_contracts || '{"erc20-1"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';
UPDATE account SET balance_on_erc20_contracts = balance_on_erc20_contracts || '{"erc20-2"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';
UPDATE account SET balance_on_erc20_contracts = balance_on_erc20_contracts || '{"erc20-3"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';
UPDATE account SET balance_on_erc20_contracts = balance_on_erc20_contracts || '{"erc20-2"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';

UPDATE account SET balance_on_nft_contracts = balance_on_nft_contracts || '{"nft-1"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';
UPDATE account SET balance_on_nft_contracts = balance_on_nft_contracts || '{"nft-2"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';
UPDATE account SET balance_on_nft_contracts = balance_on_nft_contracts || '{"nft-3"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';
UPDATE account SET balance_on_nft_contracts = balance_on_nft_contracts || '{"nft-2"}'
WHERE chain_id = 'chain_1-1' AND bech32_address = 'addr-1';

INSERT INTO recent_accounts_transaction (chain_id, height, hash, epoch, message_types) VALUES
    ('chain_1-1', 1, 'hash-1-1', 1, ARRAY['type-1', 'type-2']),
    ('chain_1-1', 1, 'hash-1-2', 1, ARRAY['type-1', 'type-2', 'type-3']),
    ('chain_1-1', 2, 'hash-2-1', 2, ARRAY['type-1']),
    ('chain_1-1', 3, 'hash-3-1', 2, ARRAY['type-1']),
    ('chain_1-1', 4, 'hash-4-1', 2, ARRAY['type-1']),
    ('chain_1-1', 5, 'hash-5-1', 2, ARRAY['type-1']);

INSERT INTO ref_account_to_recent_tx (chain_id, bech32_address, height, hash) VALUES
    ('chain_1-1', 'addr-1', 1, 'hash-1-1'),
    ('chain_1-1', 'addr-1', 1, 'hash-1-2'),
    ('chain_1-1', 'addr-1', 2, 'hash-2-1'),
    ('chain_1-1', 'addr-1', 3, 'hash-3-1'),
    ('chain_1-1', 'addr-1', 4, 'hash-4-1'),
    ('chain_1-1', 'addr-1', 5, 'hash-5-1'),
    ('chain_1-1', 'addr-2', 1, 'hash-1-1'),
    ('chain_1-1', 'addr-2', 2, 'hash-2-1');

CALL func_cleanup_zero_ref_count_recent_accounts_transaction();