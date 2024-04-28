import Big from 'big.js';

export function formatNumber(value: number | Big | string) {
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
  decimals: number = 0
) {
  return formatNumber(divideAmountByDecimals(value, decimals));
}
