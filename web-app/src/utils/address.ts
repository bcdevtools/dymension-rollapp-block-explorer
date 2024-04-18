import {
  COSMOS_ADDRESS_REGEX,
  EVM_ADDRESS_REGEX,
  TX_HASH_ADDRESS_REGEX,
} from '@/consts/address';
import { bech32 } from 'bech32';
import { getAddress } from '@ethersproject/address';

export function isEvmAddress(value: string) {
  return EVM_ADDRESS_REGEX.test(value);
}

export function isCosmosAddress(value: string) {
  return COSMOS_ADDRESS_REGEX.test(value);
}

export function isTxHash(value: string) {
  return TX_HASH_ADDRESS_REGEX.test(value);
}

export class RollappAddress {
  static fromBech32(bech32Address: string, prefix?: string) {
    const decoded = bech32.decode(bech32Address);

    if (prefix && decoded.prefix !== prefix) {
      throw new Error('Unmatched prefix');
    }

    return new RollappAddress(
      new Uint8Array(bech32.fromWords(decoded.words)),
      decoded.prefix
    );
  }

  static fromHex(hex: string, prefix: string) {
    hex = hex.replace('0x', '');
    return new RollappAddress(Uint8Array.from(Buffer.from(hex, 'hex')), prefix);
  }

  static fromString(value: string, prefix: string, isEvmChain: boolean = true) {
    if (isEvmChain && isEvmAddress(value))
      return RollappAddress.fromHex(value, prefix);
    else if (isCosmosAddress(value)) {
      try {
        return RollappAddress.fromBech32(value, prefix);
      } catch (e) {
        return null;
      }
    } else null;
  }

  constructor(
    public readonly address: Uint8Array,
    public readonly prefix: string
  ) {}

  toBech32() {
    const words = bech32.toWords(this.address);
    return bech32.encode(this.prefix, words);
  }

  toHex(checksum: boolean = true) {
    const hex = Buffer.from(this.address).toString('hex');

    if (hex.length === 0) {
      throw new Error('Empty address');
    }

    if (checksum) {
      return getAddress(hex);
    } else {
      return '0x' + hex;
    }
  }
}

export interface Bech32Config {
  readonly bech32PrefixAccAddr: string;
  readonly bech32PrefixAccPub: string;
  readonly bech32PrefixValAddr: string;
  readonly bech32PrefixValPub: string;
  readonly bech32PrefixConsAddr: string;
  readonly bech32PrefixConsPub: string;
}

export function getDefaultBech32Config(
  mainPrefix: string,
  validatorPrefix: string = 'val',
  consensusPrefix: string = 'cons',
  publicPrefix: string = 'pub',
  operatorPrefix: string = 'oper'
): Bech32Config {
  return {
    bech32PrefixAccAddr: mainPrefix,
    bech32PrefixAccPub: mainPrefix + publicPrefix,
    bech32PrefixValAddr: mainPrefix + validatorPrefix + operatorPrefix,
    bech32PrefixValPub:
      mainPrefix + validatorPrefix + operatorPrefix + publicPrefix,
    bech32PrefixConsAddr: mainPrefix + validatorPrefix + consensusPrefix,
    bech32PrefixConsPub:
      mainPrefix + validatorPrefix + consensusPrefix + publicPrefix,
  };
}