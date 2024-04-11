import sha3 from 'crypto-js/sha3';

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export function isAddress(address: string) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false;
  } else if (
    /^(0x)?[0-9a-f]{40}$/.test(address) ||
    /^(0x)?[0-9A-F]{40}$/.test(address)
  ) {
    // If it's all small caps or all all caps, return true
    return true;
  } else {
    // Otherwise check each case
    return isChecksumAddress(address);
  }
}

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export function isChecksumAddress(address: string) {
  // Check each case
  address = address.replace('0x', '');
  const addressHash = sha3(address.toLowerCase());

  for (let i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      //@ts-ignore
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      //@ts-ignore
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Makes a checksum address
 *
 * @method toChecksumAddress
 * @param {String} address the given HEX adress
 * @return {String}
 */
export function toChecksumAddress(address: string) {
  if (typeof address === 'undefined') return '';

  address = address.toLowerCase().replace('0x', '');
  const addressHash = sha3(address);
  let checksumAddress = '0x';

  for (let i = 0; i < address.length; i++) {
    // If ith character is 9 to f then make it uppercase
    //@ts-ignore
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
}
