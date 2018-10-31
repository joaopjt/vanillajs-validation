/* eslint-disable */

// Validator main
( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'underscore/underscore',
      './default-messages',
      './validation-rules'
    ], function( _, defaultMessages, validationRules ) {
      return factory( window, _, defaultMessages, validationRules );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('underscore'),
      require('./default-messages'),
      require('./validation-rules')
    );
  } else {
    // browser global
    var _Flickity = window.Flickity;

    window.Flickity = factory(
      window,
      window._,
      _Flickity.defaultMessages,
      _Flickity.validationRules
    );
  }

}( window, function factory( window, _, defaultMessages, validationRules ) {
  'use strict';

  function Form (form, options) {
    this.form = form;
    this.formInputs = [];
    this.rules = (options.rules) ? options.rules : {};
    this.errorList = [];
    this.errorClass = (options.errorClass) ? options.errorClass : 'invalid';
    this.messages = (options.messages) ? options.messages : {};
    this.onfocusout = (options.onfocusout) ? options.onfocusout : null;
    this.errorPlacement = (options.errorPlacement) ? options.errorPlacement : null;
    this.submitHandler = (options.submitHandler) ? options.submitHandler : null;
    this.invalidHandler = (options.invalidHandler) ? options.invalidHandler : null;

    if (!this.rules) {
      this.setupRules();
    }

    this.listInputs();
    this.setup();
  }

  var proto = Form.prototype;

  /**
   * @param {Node} holder
   */
  proto.addErrorClass = function(holder) {
    if (!holder.classList.contains(this.errorClass)) {
      holder.classList.add(this.errorClass);
    }
  };

  /**
   * @param {Object} input
   * @param {Object} err
   */
  proto.addErrorMessage = function(input, err) {
    var errField = input.errField;
    var error = this.getError(err, input.el.name);

    if (!errField.innerHTML || error.rule === "required") {
      errField.dataset.inputError = error.rule;
      errField.innerHTML = error.message
    }
  }; 

  /**
   * @param  {integer} i [Index of element on formInputs list]
   * @param  {string} r [Name of the validated rule]
   */
  proto.clearError = function(i, r) {
    var errorItem = _.findIndex(this.errorList, { rule: r, inputIndex: i });

    if (typeof errorItem === "number") {
      var input = this.formInputs[i];

      this.removeErrorClass(input.holder);
      this.removeErrorMessage(input.errField);
      this.errorList.splice(errorItem, 1);
    }
  };

  /**
   * @param  {Object} err
   * @return {Object}
   */
  proto.getError = function(err) {
    var error = { rule: err.rule };

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
  };

  proto.listInputs = function() {
    var self = this;

    Array.from(this.form.querySelectorAll('[data-field-holder]')).forEach((h) => {
      var el = h.querySelector('input:not([disabled])');

      if (el && this.rules[el.name]) {
        var inputInfo = {
          el,
          errField: h.querySelector('[data-field-error]'),
          holder: h,
          rules: (self.rules[el.name] === "required") ? {required: true} : self.rules[el.name],
          valid: null
        };

        this.formInputs.push(inputInfo);
      }
    });
  };

  proto.mapErrors = function() {
    if (!this.errorPlacement) {
      this.errorList.forEach((err) => {
        var input = this.formInputs[err.inputIndex];
        var holder = input.holder;
        var errField = input.errField;
      
        this.addErrorClass(holder);
        this.addErrorMessage(input, err);
     });
    } else {
      this.mapForErrorPlacement();
    }
  };

  proto.mapForErrorPlacement = function() {
    var errors = [];

    this.formInputs.forEach((i) => {
      var findInputErrors = _.where(this.errorList, { el: i.el });

      if (findInputErrors.length) {
        var findRequiredRule = _.where(findInputErrors, { rule: "required" });
        
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
  };

  /**
   * @param {Event} e [Get submit form event]
   */
  proto.onSubmit = function(e) {
    e.preventDefault();

    if (!this.validate().hasError) {
      if (this.submitHandler) {
        this.submitHandler.call(this, this.form);
      } else {
        e.currentTarget.submit();
      }
    }
  };

  /**
   * @param  {Node}
   */
  proto.removeErrorClass = function(elHolder) {
    if (elHolder.classList.contains(this.errorClass)) {
      elHolder.classList.remove(this.errorClass);
    }
  };

  /**
   * @param  {Node}
   */
  proto.removeErrorMessage = function(errorSpan) {
    if (errorSpan.innerHTML && errorSpan.dataset.inputError) {
      errorSpan.innerHTML = "";
      errorSpan.dataset.inputError = "";
    }
  };

  /**
   * @param  {Object} el [Element data object in formInputs array]
   * @param  {Integer} index [Index of element in formInputs array]
   * @return {Object} [Return data object with updated data]
   */
  proto.validateInput = function(el, index, cb) {
    var input = el;

    if (!index && typeof index !== "number") {
      var ind = _.findIndex(this.formInputs, { el: input });

      input = this.formInputs[ind];
      index = ind;
    }

    Object.entries(input.rules).forEach((r) => { // Run at rules Object
      var errorInList = _.findIndex(this.errorList, { el: input.el, rule: r[0], inputIndex: index });
      var errorInInput = _.findIndex(this.errorList, { el: input.el, inputIndex: index });

      if(!this.validateValue(input.el.value, r[0], r[1])) {  // Make the validation
        if(errorInList < 0) {
          input.valid = false;
          
          this.errorList.push({
            el: input.el,
            rule: r[0],
            required: r[1],
            inputIndex: index
          });

          if (this.invalidHandler) this.invalidHandler.call(this, this);
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

    if (typeof cb === "function") cb();

    return input;
  };

  /**
   * @param  {[string, integer, boolean]} v [Input value]
   * @param  {[string]} r [Rule name]
   * @param  {[string, integer]} rv [Rule param value]
   * @return {boolean}
   */
  proto.validateValue = function(v, r, rv) {
    return validationRules[r].call(this, v, rv);
  };

  proto.validate = function() {
    this.formInputs = this.formInputs.map(this.validateInput.bind(this));

    if (this.errorList.length > 0) {
      this.mapErrors()

      return {
        hasError: true,
        errorCount: this.errorList.length
      }
    } else {
      return {
        hasError: false
      }
    }
  };

  proto.setupListeners = function(evt) {
    var self = this;

    Array.from(this.form.querySelectorAll('[data-field-holder]')).forEach((h) => {
      var el = h.querySelector('input:not([disabled])');
      var mapped = _.findIndex(this.formInputs, { el });

      if (mapped >= 0) {
        el.addEventListener(evt, self.validateInput.bind(self, el, null, function() {
          if (self.errorList.length > 0) {
            self.mapErrors();
          }
        }));
      }
    });
  };

  proto.setup = function() {
    this.form.addEventListener('submit', this.onSubmit.bind(this));

    if (this.onfocusout) {
      this.setupListeners('focusout');
    }
  };

  return Form;

}));
