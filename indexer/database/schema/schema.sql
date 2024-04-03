-- table chains_info
CREATE TABLE chains_info (
    chain_id            TEXT    NOT NULL,
    "name"              TEXT    NOT NULL,
    chain_type          TEXT    NOT NULL,
    bech32              JSONB   NOT NULL,
    denoms              JSONB   NOT NULL,
    be_json_rpc_urls    TEXT[], -- sorted, the best one is the first, might be empty

    CONSTRAINT chains_info_pkey PRIMARY KEY (chain_id),
    CONSTRAINT unique_chain_name UNIQUE ("name")
);
