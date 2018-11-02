/* eslint-disable */
// Blacklist common values.
const blackList = [
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
];

const verifierDigit = digits => {
  const size = digits.length + 1;
  const mod11 = digits
    .map((digit, index) => digit * (size - index))
    .reduce((a, b) => a + b) % 11;

  return mod11 <= 1 ? 0 : 11 - mod11;
};

export default {
  isValid(v) {
    let number = v.toString().replace(/\D/g, "");

    if (number.length != 11 || blackList.includes(number)) return false;

    const digits = number.split("").map(digit => parseInt(digit, 10));
    const cpfDigits = digits.slice(0, 9);
    let vDigits = digits.slice(9, 2);

    const v1 = verifierDigit(cpfDigits);
    const v2 = verifierDigit([...cpfDigits, v1]);

    return [v1, v2].join == vDigits.join;
  }
}