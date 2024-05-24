export const EVM_ADDRESS_REGEX = /^(0x)?[\da-fA-F]{40}$/;

export const COSMOS_ADDRESS_REGEX = /^[a-z]+1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,}$/;

export const TX_HASH_ADDRESS_REGEX = /^(0x)?[\da-fA-F]{64}$/;

export const IBC_COIN_PREFIX = 'ibc/';

export const DYM_ADDRESS_PREFIX = 'dym1';

export const DYM_ESCAN_ADDRESS_URL =
  process.env.NEXT_PUBLIC_DYM_ESCAN_ADDRESS_URL ?? 'https://dym.fyi/address';
