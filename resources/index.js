import _ from 'underscore';
import defaultMessages from './default-messages';
import validationRules from './validation-rules';

let vjsvmsg = defaultMessages;
let vjsvrls = validationRules;

export default class VanillaValidator {
  constructor(form, options) {
    this.form = form;
    this.formInputs = [];
    this.customRules = (options.customRules) ? options.customRules : {};
    this.validationMessages = vjsvmsg;
    this.validationHandlers = vjsvrls;
    this.submitEventIntercept = (options.submitEventIntercept) ? options.submitEventIntercept : null;
    this.fieldHolderSelector = (options.fieldHolderSelector) ? options.fieldHolderSelector : '[data-field-holder]';
    this.rules = (options.rules) ? options.rules : {};
    this.errorList = [];
    this.errorClass = (options.errorClass) ? options.errorClass : 'invalid';
    this.messages = (options.messages) ? options.messages : {};
    this.onfocusout = (options.onfocusout) ? options.onfocusout : null;
    this.beforeErrorPlacement = (options.beforeErrorPlacement) ? options.beforeErrorPlacement : null;
    this.errorPlacement = (options.errorPlacement) ? options.errorPlacement : null;
    this.submitHandler = (options.submitHandler) ? options.submitHandler : null;
    this.invalidHandler = (options.invalidHandler) ? options.invalidHandler : null;
    this.submitListenerHandler = this.onSubmit.bind(this);

    if (!this.rules) {
      this.setupRules();
    }

    this.listInputs();
    this.init();
  }

  /**
   * Add a custom rule to Validator instance
   * @param {string} n [Custom rule name]
   * @param {[type]} f [Custom rule function]
   */
  addCustomRule(n, f) {
    if (!this.customRules[n]) {
      if (typeof f !== "function") {
        throw new Error('The second param to "addCustomRule" should be a function!');
      } else {
        this.customRules[n] = f;
      }
    }
  }

  /**
   * Add a custom rule to Validator instance
   * @param {string} r [Custom rule name]
   * @param {string/function} m [Custom message]
   */
  addCustomRuleMessage(r, m) {
    if (!this.validationMessages[r]) {
      if (typeof m === "string" || typeof m === "function") {
        this.validationMessages[r] = m;
      } else {
        throw new Error('The second param to "addCustomRuleMessage" should be a string or a function!');
      }
    }
  }

  /**
   * @param DOM holder [Receive the input holder Node element]
   * @param DOM input [Receive the input Node element]
   */
  addError(holder, input) {
    if (!holder.classList.contains(this.errorClass)) {
      holder.classList.add(this.errorClass);
      input.setAttribute('aria-invalid', 'true');
    }
  }

  /**
   * @param {Object} input
   * @param {Object} err
   */
  addErrorMessage(input, err) {
    const { errField } = input;
    const error = this.getError(err, input.el.name);

    if (!errField.innerHTML || error.rule === 'required') {
      errField.dataset.inputError = error.rule;
      errField.innerHTML = error.message;
    }
  }

  /**
   * @param  {integer} i [Index of element on formInputs list]
   * @param  {string} r [Name of the validated rule]
   */
  clearError(i, r) {
    const errorItem = _.findIndex(this.errorList, { rule: r, inputIndex: i });
    
    if (typeof errorItem === 'number') {
      const input = this.formInputs[i];

      this.removeError(input.holder, input.el);
      VanillaValidator.removeErrorMessage(input.errField);
      this.errorList.splice(errorItem, 1);
    }
  }

  clearErrors() {
    if (!this.errorPlacement) {
      this.errorList.forEach((err) => {
        const input = this.formInputs[err.inputIndex];
        const { el, holder } = input;

        this.removeError(holder, el);
        VanillaValidator.removeErrorMessage(input.errField);
      });
    }

    this.errorList = [];
  }

  /**
   * Destroy validator instance
   * @return void
   */
  destroy() {
    this.form.removeEventListener('submit', this.submitListenerHandler);

    this.clearErrors();
    this.formInputs = [];

    return null;
  }

  /**
   * @param  {Object} err
   * @return {Object}
   */
  getError(err) {
    const error = { rule: err.rule };

    if (typeof this.validationMessages[err.rule] === 'function') {
      error.message = this.validationMessages[err.rule](err.required);
    } else {
      error.message = this.validationMessages[err.rule];
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

    Array.from(this.form.querySelectorAll(this.fieldHolderSelector)).forEach((h) => {
      const el = h.querySelector('input:not([disabled])') || h.querySelector('textarea:not([disabled])');

      if (el && this.rules[el.name]) {
        const inputInfo = {
          el,
          errField: h.querySelector('[data-field-error]'),
          holder: h,
          rules: (self.rules[el.name] === 'required') ? { required: true } : self.rules[el.name],
          valid: null,
        };

        this.formInputs.push(inputInfo);
      }
    });
  }

  mapErrors() {
    if (!this.errorPlacement) {
      this.errorList.forEach((err) => {
        const input = this.formInputs[err.inputIndex];
        const { el, holder } = input;

        this.addError(holder, el);
        this.addErrorMessage(input, err);
      });
    } else {
      this.mapForErrorPlacement();
    }
  }

  mapForErrorPlacement() {
    const errors = [];

    this.formInputs.forEach((i) => {
      const findInputErrors = _.where(this.errorList, { el: i.el });

      if (findInputErrors.length) {
        const findRequiredRule = _.where(findInputErrors, { rule: 'required' });

        if (findRequiredRule.length) {
          errors.push(findRequiredRule[0]);
        } else {
          errors.push(findInputErrors[0]);
        }
      }
    });

    if (this.beforeErrorPlacement) {
      this.beforeErrorPlacement.call(this, this);
    }

    errors.forEach((err) => {
      this.errorPlacement.call(this, this.getError(err), err.el);
    });
  }

  /**
   * @param {Event} e [Get submit form event]
   */
  onSubmit(e) {
    e.preventDefault();

    if (this.submitEventIntercept) {
      this.submitEventIntercept.call(this, e, this);
    }

    if (!this.validate().hasError) {
      if (this.submitHandler) {
        this.submitHandler.call(this, this.form);
      } else {
        e.currentTarget.submit();
      }
    } else {
      if (this.invalidHandler) this.invalidHandler.call(this, this);
    }
  }

  /**
   * @param DOM holder [The input holder Node element]
   * @param DOM input [The input Node element]
   */
  removeError(holder, input) {
    if (holder.classList.contains(this.errorClass)) {
      input.setAttribute('aria-invalid', 'false');
      holder.classList.remove(this.errorClass);
    }
  }

  /**
   * @param DOM errorSpan
   */
  static removeErrorMessage(errorSpan) {
    if (errorSpan && errorSpan.innerHTML && errorSpan.dataset.inputError) {
      errorSpan.innerHTML = '';
      errorSpan.dataset.inputError = '';
    }
  }

  /**
   * @param  {Object} el [Element data object in formInputs array]
   * @param  {Integer} i [Index of element in formInputs array]
   * @return {Object} [Return data object with updated data]
   */
  validateInput(el, i, cb) {
    let input = el;
    let index = i;

    if (!i && typeof i !== 'number') {
      const ind = _.findIndex(this.formInputs, { el: input });

      input = this.formInputs[ind];
      index = ind;
    }

    Object.entries(input.rules).forEach((r) => { // Run at rules Object
      const errorInList = _.findIndex(this.errorList, {
        el: input.el,
        rule: r[0],
        inputIndex: index,
      });
      const errorInInput = _.findIndex(this.errorList, {
        el: input.el,
        inputIndex: index,
      });

      if (!this.validateValue(input.el.value, r[0], r[1])) { // Make the validation
        if (errorInList < 0) {
          input.valid = false;

          this.errorList.push({
            el: input.el,
            rule: r[0],
            required: r[1],
            inputIndex: index,
          });
        }
      } else {
        if (errorInList >= 0) {
          this.clearError(index, r[0]);
        }

        if (errorInInput < 0) {
          input.valid = true;
        }
      }
    });

    if (typeof cb === 'function') cb();

    return input;
  }

  /**
   * @param  {[string, integer, boolean]} v [Input value]
   * @param  {[string]} r [Rule name]
   * @param  {[string, integer]} rv [Rule param value]
   * @return {boolean}
   */
  validateValue(v, r, rv) {
    if (this.validationHandlers[r]) {
      return this.validationHandlers[r].call(this, v, rv);
    } else if (this.customRules[r]) {
      return this.customRules[r].call(this, v, rv);
    } else {
      throw new Error('Undefined rule ' + r + '.');
    }
  }

  validate() {
    this.formInputs = this.formInputs.map(this.validateInput.bind(this));

    if (this.errorList.length > 0) {
      this.mapErrors();

      return {
        hasError: true,
        errorCount: this.errorList.length,
      };
    }

    return { hasError: false };
  }

  setupListeners(evt) {
    const self = this;

    Array.from(this.form.querySelectorAll(this.fieldHolderSelector)).forEach((h) => {
      const el = h.querySelector('input:not([disabled])');
      const mapped = _.findIndex(this.formInputs, { el });

      if (mapped >= 0) {
        el.addEventListener(evt, self.validateInput.bind(self, el, null, () => {
          if (self.errorList.length > 0) {
            self.mapErrors();
          }
        }));
      }
    });
  }

  init() {
    this.form.addEventListener('submit', this.submitListenerHandler);

    if (this.onfocusout) {
      this.setupListeners('focusout');
    }

    if (this.onkeypress) {
      this.setupListeners('keypress');
    }
  }
}

export {
  defaultMessages,
  validationRules
}
