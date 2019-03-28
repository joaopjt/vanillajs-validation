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

const verify = cpf => {
  var nums, digitos, soma, i, resultado, equalDigits;
  equalDigits = 1;

  for (i = 0; i < cpf.length - 1; i++)
    if (cpf.charAt(i) != cpf.charAt(i + 1)) {
      equalDigits = 0;
      break;
    }

  if (!equalDigits) {
    nums = cpf.substring(0,9);
    digitos = cpf.substring(9);
    soma = 0;
    for (i = 10; i > 1; i--)
          soma += nums.charAt(10 - i) * i;
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
          return false;
    nums = cpf.substring(0,10);
    soma = 0;
    for (i = 11; i > 1; i--)
          soma += nums.charAt(11 - i) * i;
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
    return true;
  } else {
    return false;
  }
}

export default {
  isValid(v) {
    let number = v.toString().replace(/\D/g, "");

    if (number.length != 11 || blackList.includes(number)) return false;

    return verify(number);
  }
}