const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const ValidatorRules = {
  required(value, msg = 'Vui lòng nhập trường này') {
    return value && undefined || msg;
  },
  email(value, msg = 'Email không hợp lệ') {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(value).toLowerCase()) && undefined || msg;
  },
  min(min) {
    return (value, msg = `Độ dài chuỗi tối thiểu từ ${min} kí tự`) => (value.length >= min && undefined || msg);
  },
  max(max) {
    return (value, msg = `Độ dài chuỗi tối đa là ${max} kí tự`) => (value.length <= max && undefined || msg);
  },
}

const ValidatorEvents = {
  Rules: ValidatorRules,
  FuncRules: {},
  ErrorRules: {},

  onblur(elements) {
    if (this.FuncRules && this.ErrorRules) {
      elements?.forEach(element => {
        element.onblur = (e) => {
          console.log(e);
        }
      })
    }
  },
  onlick() {

  }
};

const ValidatorFuncs = {
  Rules: ValidatorRules,

  getErrorInRules(elements, callback) {
    elements.forEach(e => {
      let name = e.getAttribute('name');
      let rules = [];
      e.getAttribute('validate-errors').split('|').forEach(msgError => {
        rules.push(msgError);
      });
      callback(name, rules);
    });
  },

  getFuncInRules(elements, callback) {
    elements.forEach(e => {
      let name = e.getAttribute('name');
      let rules = [];
      e.getAttribute('validate-rules').split('|').forEach(rule => {
        if (rule.includes(':')) {
          let ruleInfo = rule.split(':');
          rules.push(this.Rules[ruleInfo[0]](ruleInfo[1]));
        } else {
          rules.push(this.Rules[rule]);
        }
      });
      callback(name, rules);
    });
  }
}

const Validator = (formSelector) => {
  const Funcs = ValidatorFuncs;
  const Events = ValidatorEvents;

  let funcRules = {};
  let msgErrors = {};
  let eForm = $(formSelector);
  if (eForm) {

    let eInputs = eForm.querySelectorAll('[name][validate-rules]');
    let eErrors = eForm.querySelectorAll('[name][validate-errors]');

    Funcs.getFuncInRules(eInputs, (name, rules) => {
      funcRules[name] = rules;
    });
    // console.log(funcRules);

    Funcs.getErrorInRules(eErrors, (name, rules) => {
      msgErrors[name] = rules;
    });
    // console.log(msgErrors);
    Events.FuncRules = funcRules;
    Events.ErrorRules = msgErrors;
    Events.onblur(eInputs);
  };
}