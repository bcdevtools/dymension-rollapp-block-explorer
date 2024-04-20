import Big from 'big.js';

export function formatNumber(value: number | Big | string) {
  if (typeof value === 'number') return value.toLocaleString();
  return formatNumberString(value.toString());
}

export function formatNumberString(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function divideAmountByDecimals(amount: Big | string, decimals: number) {
  if (!(amount instanceof Big)) amount = new Big(amount);
  return amount.div(new Big(10 ** decimals));
}

export function formatBlockchainAmount(
  value: string | Big,
  decimals: number = 18
) {
  return formatNumber(divideAmountByDecimals(value, decimals));
}
