# Vanilla Validation

A lightweight validation form inspired in [Jquery Validation](https://jqueryvalidation.org) (Still under coding).

⚡️ 24kb in browser only. As a project dependency, it falls to 6kb only.

## Getting Started

**Download** the script file clicking [here](http://github.com/joaopjt/vanillajs-validation/blob/master/dist/vanillajs-validation.min.js)

OR

**Install package** via npm:
```bash
npm install vanillajs-validation
```
---

### Creating instance
```html
<form data-form>
  <div data-field-holder>
    <input name="firstfield" />
    <span data-field-error></span>
  </div>
  <div data-field-holder>
    <input name="cpf" />
    <span data-field-error></span>
  </div>
  <div data-field-holder>
    <input name="test" />
    <span data-field-error></span>
  </div>
</form>


<script src="vanillajs-validation.min.js"></script> // Import downloaded script file
<script type="text/javascript">
  var form = document.querySelector('[data-form]');
  var v = new vanillaValidation(form, {
    customRules: {
      valueIs: function (inputValue, ruleValue) {
        return inputValue === ruleValue;
      },
    },
    rules: {
      firstfield: {
        minlength: 2,
        required: true
      },
      cpf: {
        cpf: true,
        required: true
      },
      test: {
        valueIs: 'customRuleTest'
      }
    },
    messages: {
      firstfield: {
        minlength: 'This input should have at least 2 characters.',
        required: 'Input value required!'
      },
      test: {
        valueIs: 'The field value must be "customRuleTest".'
      }
    }
  });
</script>
```

You can import the module with ES6 syntax too:

```javascript
// const Validator = require('vanillajs-validation');
import Validator from 'vanillajs-validation';

const formValidation = new Validator(document.querySelector('[data-form]', {
  rules: {
    ...
  }
});
```
---
### Rules (required)

The rules should be an **object** passed by in ``options`` at the follow format:
```javascript
rules: {
  fieldName: {
    ruleName: value
  }
}
```

The default rules avaiable are:

|Rule Name       |Value Type                     |Description              |
|----------------|-------------------------------|-------------------------|
|`cep`           |**boolean**                    | [BR] postal code format |
|`cpf`           |**boolean**                    | [BR] CPF number         |
|`cnpj`          |**boolean**                    | [BR] CNPJ  number       |
|`email`         |**boolean**                    | Verify email format     |
|`equalTo`       |**string**               | A input selector string |
|`digits`        |**boolean**              | Only numbers            |
|`maxlength`     |**integer**              | Max value length        |
|`minlength`     |**integer**              | Min value length        |
|`required`      |**boolean**              | Not empty value         |

---

### Custom Error Messages
Adding a ``messages`` **object** in ``options`` at the follow format:

```javascript
messages: {
  fieldName: {
    ruleName: 'errorMessage goes here'
  }
}
```

### Custom Field Holder Selector
You can change the default field holder selector (``[data-field-holder]``) adding the key ``fieldHolderSelector`` in ``options`` at the follow format:

```javascript
const formValidation = new Validator(document.querySelector('[data-form]', {
  fieldHolderSelector: '.field-holder'
});
```

## Advanced
### ``vanillaValidation``(``Form``, ``Options``)

**Form**
> Type: **DOM Element**
>
> The form DOM element

**Options**
> Type: **Object**
>
> Object with configuration, rules and custom error messages

### ``.addCustomRule``(``customRuleName``, ``customRuleFunction``)

**customRuleName**
> Type: **String**
>
> Name of the custom rule.

**customRuleFunction**
> Type: **Function**
>
> The function with the input validation flow. This function will receive 2 params, the **inputValue** and the **ruleValue**. Exemple:

```javascript
  var v = new Validate(form, {
    rules: {
      testField: {
        valueIs: "customRuleTutorial"
      }
    },
    messages: {
      testField: {
        valueIs: "The value should be 'customRuleTutorial'."
      }
    }
  });

  v.addCustomRule('valueIs', function(inputValue, ruleValue) {
    return inputValue === ruleValue;
  });
```

> You can add a **customRules** object in **options** when creating the instance too. See the exemple bellow:

```javascript
  var v = new Validate(form, { // options
    customRules: {
      valueIs: function (inputValue, ruleValue) {
        return inputValue === ruleValue;
      }
    },
    rules: {
      testField: {
        valueIs: "customRuleTutorial"
      }
    },
    messages: {
      testField: {
        valueIs: "The value should be 'customRuleTutorial'."
      }
    }
  });
```

## ``options``:

### Events:

**onfocusout** (default: **false**)
> Type: **Boolean**
>
> If true, make field validation on the **onfocusout** event trigger.

```javascript
{ // options object
  onfocusout: false
}
```

### Handlers:

**errorPlacement**
> Type: **Function**
>
> After a submit with errors, the **errorPlacement** is called for every field with an error. The function will receive 2 params, the **error** (An object with the error type and the message) and the **input** (The node of the input with error).

```javascript
{ // options object
  errorPlacement: function (error, input) {
    console.log(error); // { rule: exempleRule, message: 'The field has a exempleRule error' }
    console.log(field); // <input name="exemple" type="text" />
  }
}
```

**beforeErrorPlacement**
> Type: **Function**
>
> This will be called only if the **errorPlacement** has been defined.
> With personalized **errorPlacement**, you will need to clean the personalized error fields. This handler is exactly for resolve this issue.
> A param with validator instance is retorned to the handler function. See bellow:

```javascript
{ // options object
  beforeErrorPlacement: function (validator) {
    ... // Do the clear personalized input error fields
  }
}
```

**invalidHandler**
> Type: **Function**
>
> Called on submit if form has a error. The function receives one param: the **validator** with the instance object of vanillajs-validation;

```javascript
{ // options object
  invalidHandler: function (validator) {
    console.log(validator); // Validator instance object
  }
}
```

**submitHandler**
> Type: **Function**
>
> Called on submit instead of default form submit. The function receives one param: the **form** with the node reference to form;

```javascript
{ // options object
  submitHandler: function (form) {
    console.log(form); // <form data-form> ... </form>
  }
}
```

### Others:

**customRules**
> Type: **Object**
>
> This object can receive new custom rules. The function of custom rule receive two params: **inputValue** with the input value and the **ruleValue**, with rule value

```javascript
{ // options object
  customRules: {
    valueIs: function (inputValue, ruleValue) {
      // Verify if input value is 'ruleValueHere',
      // or other value write bellow, in 'rules' for 'exempleInput' key.      
      return inputValue === ruleValue; 
    }
  },
  rules: {
    exempleInput: {
      valueIs: 'ruleValueHere'
    }
  }
}
```

**submitEventIntercept**
> Type: **function**
>
> A function called on the first submit form event trigger, before the form validation and handlers call. It returns the submit **event** and the **validator** as params

```javascript
{ // options object
  submitEventIntercept: function (e, v) {
    e.stopImmediatePropagation(); // In case a second JS is listening to the submit event, you can use this to prevent the listener call
    console.log(v); // Validator instance
  }
}
```

**

## Contribute

In first of all, fork the repo.

After clone the fork, make sure of use node `v6.11.4`. Install the dependencies, and **rollup** globally.
To build files, use the `rollup -c`.

Then, make a pull request with a nice description of changes.

## License

[MIT License](https://opensource.org/licenses/MIT).

## Made with ❤️ by
- [João Julio](http://github.com/joaopjt)

> be a part of this list too, contribute with us :)
