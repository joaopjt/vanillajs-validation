/* eslint-disable */
import _ from 'underscore';
import defaultMessages from './default-messages';
import validationRules from './validation-rules'

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
      error.message = defaultMessages[err.rule](err.required);
    } else {
      error.message = defaultMessages[err.rule];
    }
    
    if (this.messages) {
      if (this.messages[err.el.name]) {
        if (this.messages[err.el.name][err.rule]) {
          error.message = this.messages[err.el.name][err.rule];
        }
      }
    }

    return error;
  }

  listInputs() {
    const self = this;

    Array.from(this.form.querySelectorAll('[data-field-holder]')).forEach((h) => {
      const el = h.querySelector('input:not([disabled])');

      if (el && this.rules[el.name]) {
        let inputInfo = {
          el,
          errField: h.querySelector('[data-field-error]'),
          holder: h,
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
      if (this.invalidHandler) this.invalidHandler.call(this, this);

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
   * @param  {[string, integer, boolean]} v [Input value]
   * @param  {[string]} r [Rule name]
   * @param  {[string, integer]} rv [Rule param value]
   * @return {boolean}
   */
  validateValue(v, r, rv) {
    return validationRules[r].call(this, v, rv);
  }

  validate() {
    this.formInputs = this.formInputs.map((i, index) => {
      let input = i;

      Object.entries(i.rules).forEach((r) => { // Run at rules Object
        let errorInList = _.findIndex(this.errorList, { el: i.el, rule: r[0], inputIndex: index });
        let errorInInput = _.findIndex(this.errorList, { el: i.el, inputIndex: index });

        if(!this.validateValue(i.el.value, r[0], r[1])) {  // Make the validation
          if(errorInList < 0) {
            input.valid = false;
            
            this.errorList.push({
              el: i.el,
              rule: r[0],
              required: r[1],
              inputIndex: index
            });
          }
        } else {
          if (errorInList >= 0) {
            this.clearError(index, r[0])
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

export default {
  create(el, opts) {
    let instance = new Form(el, opts);

    return instance;
  }
}