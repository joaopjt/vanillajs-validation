/* eslint-disable */
import cpf from './rules/cpf';
import cnpj from './rules/cnpj';

/**
 * The follow functions will receive 2 params:
 * @param {[string, integer, float]} v [The input value]
 * @param {[string, integer, float]} r [The rule param value]
 */
export default {
  cep(v) {
    const regex = /^[0-9]{5}(?:-[0-9]{3})?$/;
    return regex.test(v);
  },
  cpf(v) {
    return cpf.isValid(v);
  },
  cnpj(v) {
    return cnpj.isValid(v);
  },
  email(v) {
    const regex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return regex.test(v);
  },
  equalTo(v, r) {
    const elem = this.form.querySelector(r);

    if(elem) {
      if (v === elem.value) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  digits(v) {
    const regex = /^[0-9]*$/;
    return regex.test(v);
  },
  required(v, r) {
    if (v && r) {
      return true;
    }

    return false;
  },
  minlength(v, r) {
    if (r >= 1 && v.length >= r) {
      return true;
    }

    return false;
  },
  maxlength(v, r) {
    if (r >= 1 && v.length <= r) {
      return true;
    }

    return false;
  }
};