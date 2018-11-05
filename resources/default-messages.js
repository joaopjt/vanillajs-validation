/* eslint-disable */
export default {
  cep: 'CEP inválido.',
  cpf: 'CPF inválido.',
  cnpj: 'CNPJ inválido.',
  digits: 'Apenas dígitos permitidos.',
  email: 'Email inválido.',
  required: 'Campo obrigatório.',
  minlength(n) {
    return 'O campo deve ter no minimo ' + n + ' caracteres';
  },
  maxlength(n) {
    return 'O campo deve ter no máximo ' + n + ' caracteres';
  },
};