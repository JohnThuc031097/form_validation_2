const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const ValidatorRules = {
  required(msg = 'Vui lòng nhập trường này') {
    return value => value && undefined || msg;
  },
  email(msg = 'Email không hợp lệ') {
    return value => {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(String(value).toLowerCase()) && undefined || msg;
    }
  },
  min(msg = 'Độ dài chuỗi tối thiểu không đủ') {
    return min => value => (value.length >= min && undefined || msg);
  },
  max(msg = 'Độ dài chuỗi tối đa bị vượt quá') {
    return max => value => (value.length <= max && undefined || msg);
  },
}

const ValidatorEvents = {
  Rules: ValidatorRules,
  FuncRules: {},

  onblur(elements, callback) {
    if (this.FuncRules) {
      elements?.forEach(element => {
        element.onblur = () => {
          console.log(element);
          for (const name in this.FuncRules) {
            this.FuncRules[name].forEach(func => {
              callback(name, func(element.value.trim()));
            });
          }
        }
      })
    }
  },
  onlick() {

  }
};

const ValidatorFuncs = {
  Rules: ValidatorRules,

  setMessage(eBox, eMessage, msg) {
    console.log(eBox);
    if (msg) {
      eBox.classList.add('invalid');
      eMessage.innerHTML = msg;
    } else {
      eBox.classList.remove('invalid');
      eMessage.innerHTML = '';
    }
  },

  getElementInElements(elements, callback) {
    elements.forEach(e => {
      let name = e.getAttribute('name');
      callback(name, e);
    });
  },

  getMessageInRules(elements, callback) {
    elements.forEach(e => {
      let name = e.getAttribute('name');
      let rules = [];
      e.getAttribute('validate-messages').split('|').forEach(msg => {
        rules.push(msg);
      });
      callback(name, rules);
    });
  },

  getFuncInRules(elements, msgRules, callback) {
    elements.forEach(e => {
      let name = e.getAttribute('name');
      let rules = [];
      e.getAttribute('validate-rules').split('|').forEach((rule, index) => {
        if (rule.includes(':')) {
          let ruleInfo = rule.split(':');
          rules.push(this.Rules[ruleInfo[0]](msgRules[name][index])(ruleInfo[1]));
        } else {
          rules.push(this.Rules[rule](msgRules[name][index]));
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
  let msgRules = {};
  let eBoxRules = {};
  let eMessageRules = {};
  let eForm = $(formSelector);

  if (eForm) {

    let eBoxs = eForm.querySelectorAll('[name][validate-box]');
    let eMessages = eForm.querySelectorAll('[name][validate-messages]');
    let eInputs = eForm.querySelectorAll('[name][validate-rules]');

    Funcs.getElementInElements(eBoxs, (name, element) => {
      eBoxRules[name] = element;
    });
    console.log(eBoxRules);

    Funcs.getElementInElements(eMessages, (name, element) => {
      eMessageRules[name] = element;
    });
    //console.log(eMessageRules);

    Funcs.getMessageInRules(eMessages, (name, rules) => {
      msgRules[name] = rules;
    });
    //console.log(msgErrors);

    Funcs.getFuncInRules(eInputs, msgRules, (name, rules) => {
      funcRules[name] = rules;
    });
    //console.log(funcRules);

    Events.FuncRules = funcRules;
    Events.onblur(eInputs, (name, msg) => {
      Funcs.setMessage(eBoxRules[name], eMessageRules[name], msg);
    });
  };
}