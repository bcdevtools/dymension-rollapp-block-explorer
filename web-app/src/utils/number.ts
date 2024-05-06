import Big from 'big.js';

Big.PE = 1e6;
Big.NE = -1e6;

export function formatNumber(value: number | Big | string) {
  if (!(value instanceof Big)) value = new Big(value);
  return formatNumberString(value.toString());
}

export function hexToDec(hexStr: string) {
  if (hexStr.length % 2 !== 0) {
    hexStr = '0x0' + hexStr.substring(2);
  }
  return BigInt(hexStr).toString();
}

export function formatNumberString(value: string) {
  const splitted = value.split('.');

  splitted[0] = splitted[0].replace(/\B(?=(\d{3})+$)/g, ',');
  if (splitted.length === 1) return splitted[0];
  return splitted.join('.');
}

export function divideAmountByDecimals(amount: Big | string, decimals: number) {
  if (!(amount instanceof Big)) amount = new Big(amount);
  return amount.div(new Big(10 ** decimals));
}

export function formatBlockchainAmount(
  value: string | Big,
  decimals: number = 0,
  fixed?: number
) {
  const result = divideAmountByDecimals(value, decimals);
  return formatNumber(fixed === undefined ? result : result.round(fixed));
}

export function compareNumberString(a: string, b: string) {
  return new Big(a).cmp(b);
}
