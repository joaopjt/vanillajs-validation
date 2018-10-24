/* eslint-disable */
export default {
  cep: 'CEP inválido.',
  cpf: 'CPF inválido.',
  email: 'Email inválido.',
  required: 'Campo obrigatório.',
  minlenght(n) {
    return 'O campo deve ter no minimo ' + n + ' caracteres';
  },
  maxlenght(n) {
    return 'O campo deve ter no máximo ' + n + ' caracteres';
  },
};