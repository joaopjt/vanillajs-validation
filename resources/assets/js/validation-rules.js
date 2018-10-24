/* eslint-disable */
const CPFblackList = [
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
  cep: function(v) {
    const regex = /^[0-9]{5}(?:-[0-9]{3})?$/;
    return regex.test(v);
  },
  cpf: function(v) {
    let number = v.toString().replace(/\D/g, "");

    if (number.length != 11 || CPFblackList.includes(number)) return false;

    const digits = number.split("").map(digit => parseInt(digit, 10));
    const cpfDigits = digits.slice(0, 9);
    let vDigits = digits.slice(9, 2);

    const v1 = verifierDigit(cpfDigits);
    const v2 = verifierDigit([...cpfDigits, v1]);

    return [v1, v2].join == vDigits.join;
  },
  email: function(v) {
    const regex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return regex.test(v);
  },
  digits: function(v) {
    const regex = /^[0-9]*$/;
    return regex.test(v);
  },
  required: function(v, r) {
    if (v && r) {
      return true;
    }

    return false;
  },
  minlenght: function(v, r) {
    if (r >= 1 && v.length >= r) {
      return true;
    }

    return false;
  },
  maxlenght: function(v, r) {
    if (r >= 1 && v.length <= r) {
      return true;
    }

    return false;
  }
};