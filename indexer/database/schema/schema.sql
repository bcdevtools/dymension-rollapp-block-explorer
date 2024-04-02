-- table chains_info
CREATE TABLE chains_info (
    chain_id    TEXT    NOT NULL,
    "name"      TEXT    NOT NULL,
    chain_type  TEXT    NOT NULL,
    bech32      JSONB   NOT NULL,
    denom       JSONB   NOT NULL,

    CONSTRAINT chains_info_pkey PRIMARY KEY (chain_id),
    CONSTRAINT unique_chain_name UNIQUE ("name")
);
