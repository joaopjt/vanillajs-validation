/* eslint-disable */
import _ from 'underscore';
import defaultMessages from './default-messages';
import validationRules from './validation-rules'
// const defaultMessages = [];

class Form {
  constructor(form, options) {
    this.form = form;
    this.formInputs = [];
    this.rules = (options.rules) ? options.rules : {};
    this.errorList = [];
    this.errorClass = (options.errorClass) ? options.errorClass : 'invalid';
    this.messages = (options.messages) ? options.messages : {};
    this.errorPlacement = (options.errorPlacement) ? options.errorPlacement : null;
    this.submitHandler = (options.submitHandler) ? options.submitHandler : null;
    this.invalidHandler = (options.invalidHandler) ? options.invalidHandler : null;

    if (!this.rules) {
      this.setupRules();
    }

    this.listInputs();
    this.setup();
  }

  /**
   * @param {Node}
   */
  addErrorClass(holder) {
    if (!holder.classList.contains(this.errorClass)) {
      holder.classList.add(this.errorClass);
    }
  }

  /**
   * @param {Object}
   * @param {Object}
   */
  addErrorMessage(input, err) {
    let errField = input.errField;
    let error = this.getError(err, input.el.name);

    if (!errField.innerHTML || error.rule === "required") {
      errField.dataset.inputError = error.rule;
      errField.innerHTML = error.message
    }
  } 

  /**
   * @param  {integer} i [Index of element on formInputs list]
   * @param  {string} r [Name of the validated rule]
   */
  clearError(i, r) {
    let errorItem = _.findIndex(this.errorList, { rule: r, inputIndex: i });

    if (typeof errorItem === "number") {
      let input = this.formInputs[i];

      this.removeErrorClass(input.holder);
      this.removeErrorMessage(input.errField);
      this.errorList.splice(errorItem, 1);
    }
  }

  /**
   * @param  {Object} err
   * @return {Object}
   */
  getError(err) {
    let error = { rule: err.rule };

    if (typeof defaultMessages[err.rule] === "function") {
      err.message = defaultMessages[err.rule](err.required);
    } else {
      err.message = defaultMessages[err.rule];
    }
    
    if (this.messages) {
      if (this.messages[err.el.name]) {
        if (this.messages[err.el.name][err.rule]) {
          err.message = this.messages[err.el.name][err.rule];
        }
      }
    }

    return error;
  }

  listInputs() {
    const self = this;

    Array.from(this.form.querySelectorAll('input')).forEach((el) => {
      if (this.rules[el.name]) {
        let inputInfo = {
          el,
          errField: el.parentElement.querySelector('[data-input-error]'),
          holder: el.parentElement,
          rules: (self.rules[el.name] === "required") ? {required: true} : self.rules[el.name],
          valid: null
        };

        this.formInputs.push(inputInfo);
      }
    });
  }

  mapErrors() {
    if (!this.errorPlacement) {
      this.errorList.forEach((err) => {
        const input = this.formInputs[err.inputIndex];
        const holder = input.holder;
        const errField = input.errField;
      
        this.addErrorClass(holder);
        this.addErrorMessage(input, err);
     });
    } else {
      this.mapForErrorPlacement();
    }
  }

  mapForErrorPlacement() {
    let errors = [];

    this.formInputs.forEach((i) => {
      let findInputErrors = _.where(this.errorList, { el: i.el });

      if (findInputErrors.length) {
        let findRequiredRule = _.where(findInputErrors, { rule: "required" });
        
        if (findRequiredRule.length) {
          errors.push(findRequiredRule[0]);
        } else {
          errors.push(findInputErrors[0]);
        }
      }
    });

    errors.forEach((err) => {
      this.errorPlacement.call(this, this.getError(err), err.el);
    });
  }

  /**
   * @param {Event} e [Get submit form event]
   */
  onSubmit(e) {
    e.preventDefault();

    if (this.validate().hasError) {
      this.mapErrors();
    } else {
      if (this.submitHandler) {
        this.submitHandler.call(this, this.form);
      } else {
        e.currentTarget.submit();
      }
    }
  }

  /**
   * @param  {Node}
   */
  removeErrorClass(elHolder) {
    if (elHolder.classList.contains(this.errorClass)) {
      elHolder.classList.remove(this.errorClass);
    }
  }

  /**
   * @param  {Node}
   */
  removeErrorMessage(errorSpan) {
    if (errorSpan.innerHTML && errorSpan.dataset.inputError) {
      errorSpan.innerHTML = "";
      errorSpan.dataset.inputError = "";
    }
  }

  /**
   * @param  {[string, integer, boolean]} v [Value to validate]
   * @param  {[string]} r [Rule name]
   * @param  {[string, integer]} rv [Rule param if exist]
   * @return {boolean}
   */
  validateValue(v, r, rv) {
    return validationRules[r](v, rv);
  }

  validate() {
    const self = this;

    
    this.formInputs = this.formInputs.map((i, index) => {
      let input = i;

      Object.entries(i.rules).forEach((r) => {             // Run rules Object
        let errorInList = _.findIndex(self.errorList, { el: i.el, rule: r[0], inputIndex: index });
        let errorInInput = _.findIndex(self.errorList, { el: i.el, inputIndex: index });

        if(!self.validateValue(i.el.value, r[0], r[1])) {  // Make rule validation in value
          if(errorInList < 0) {
            input.valid = false;
            
            self.errorList.push({
              el: i.el,
              rule: r[0],
              required: r[1],
              inputIndex: index
            });
          }
        } else {
          if (errorInList >= 0) {
            self.clearError(index, r[0])
          }

          if (errorInInput < 0) {
            input.valid = true;
          }
        }
      });

      return input;
    });


    if (this.errorList.length > 0) {
      return {
        hasError: true,
        errorCount: this.errorList.length
      }
    } else {
      return {
        hasError: false
      }
    }
  }

  setup() {
    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }
}

let el = document.querySelector('[data-form]');

window.validator = new Form(el, {
  errorClass: 'is-invalid',
  rules: {
    nome: "required",
    rua: {
      required: true,
      minlenght: 2
    },
    cpf: {
      cpf: true,
      digits: true,
      required: true
    },
    cep: {
      cep: true,
      required: true
    }
  },
  messages: {
    nome: {
      required: 'O campo nome é obrigatório!',
    },
    rua: {
      minlength: 'O campo rua deve ter pelo menos 2 letras!',
      required: 'O campo rua é obrigatório!',
    }
  },
  errorPlacement: function(error, element) {
    console.log(`Error:`);
    console.log(error);
    console.log(element);
  },
  submitHandler: function(form) {
    console.log(form);
  }
});