const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const ValidatorRules = {
  required(msg = 'Vui lòng nhập trường này') {
    return value => (value === '' ? msg : undefined);
  },

  email(msg = 'Email không hợp lệ') {
    return value => {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(String(value).toLowerCase()) ? undefined : msg;
    }
  },

  min(msg = 'Độ dài chuỗi tối thiểu không đủ') {
    return min => value => (value.length >= min ? undefined : msg);
  },

  max(msg = 'Độ dài chuỗi tối đa bị vượt quá') {
    return max => value => (value.length <= max ? undefined : msg);
  },

  confirmed(msg = 'Chuỗi nhập vào không khớp') {
    return name => value => {
      let valueConfirm = $(`[name="${name}"][validate-rules]`).value.trim();
      return (value === valueConfirm ? undefined : msg)
    }
  },
}

const ValidatorFuncs = {
  Rules: ValidatorRules,
  NameRules: {},

  getNameFunc(nameRule, nameFunc) {
    return this.NameRules[nameRule].some(name => name === nameFunc);
  },

  setMessage(eBox, eMessage, msg) {
    if (msg) {
      eBox.classList.add('invalid');
      eMessage.innerHTML = msg;
    } else {
      eBox.classList.remove('invalid');
      eMessage.innerHTML = '';
    }
  },

  getElementInElements(elements, callback) {
    elements?.forEach(e => {
      let name = e.getAttribute('name');
      callback(name, e);
    });
  },

  getMessageInRules(elements, callback) {
    elements?.forEach(e => {
      let name = e.getAttribute('name');
      let rules = [];
      e.getAttribute('validate-messages').split('|').forEach(msg => {
        rules.push(msg);
      });
      callback(name, rules);
    });
  },

  getNameInRules(elements, callback) {
    elements?.forEach(e => {
      let name = e.getAttribute('name');
      let nameRules = [];
      e.getAttribute('validate-rules').split('|').forEach(rule => {
        if (rule.includes(':')) {
          let ruleInfo = rule.split(':');
          nameRules.push(ruleInfo[0]);
        } else {
          nameRules.push(rule);
        }
      });
      callback(name, nameRules);
    });
  },

  getFuncInRules(elements, msgRules, callback) {
    elements?.forEach(e => {
      let name = e.getAttribute('name');
      let funcRules = [];
      e?.getAttribute('validate-rules').split('|').forEach((rule, index) => {
        if (rule.includes(':')) {
          let ruleInfo = rule.split(':');
          funcRules.push(this.Rules[ruleInfo[0]](msgRules[name][index])(ruleInfo[1]));
        } else {
          funcRules.push(this.Rules[rule](msgRules[name][index]));
        }
      });
      callback(name, funcRules);
    });
  }
}

const ValidatorEvents = {
  Rules: ValidatorRules,
  Funcs: ValidatorFuncs,
  NameRules: {},
  FuncRules: {},

  onsubmit(elements, callbackMsg, calbackResults) {
    if (this.FuncRules) {
      let acceptSubmit = true;
      let dataSubmit = {};
      this.Funcs.getElementInElements(elements, (name, element) => {
        let isRequired = this.Funcs.getNameFunc(name, 'required');
        let msg = undefined;
        let value = element.value;
        let type = element.getAttribute('type');
        if (isRequired) {
          switch (type) {
            case 'radio':
              let eRadios = element.querySelectorAll('[name][type]');
              [...eRadios].forEach(e => {
                if (e.checked) return (value = e.value);
              });
              this.FuncRules[name].some(func => {
                return (msg = func(!value && ''));
              });
              break;
            case 'checkbox':
              let eCheckboxs = element.querySelectorAll('[name][type]');
              value = [...eCheckboxs].reduce((totalvalue, e) => {
                return e.checked ? [...totalvalue, e.value] : totalvalue;
              }, []);
              this.FuncRules[name].some(func => {
                return (msg = func(value.length > 0 && value || ''));
              });
              break;
            default:
              this.FuncRules[name].some(func => {
                return (msg = func(value.trim()));
              });
              break;
          }
          msg && (acceptSubmit = false);
        }
        acceptSubmit && (dataSubmit[name] = value);
        callbackMsg(name, msg);
      });
      calbackResults(acceptSubmit && dataSubmit);
    }
  },
  onblur(elements, callback) {
    if (this.FuncRules) {
      this.Funcs.getElementInElements(elements, (name, element) => {
        let isRequired = this.Funcs.getNameFunc(name, 'required');
        if (isRequired) {
          element.onblur = () => {
            let msg = undefined;
            this.FuncRules[name].some(func => {
              return (msg = func(element.value.trim()));
            });
            callback(name, msg);
          }
        }
      });
    }
  },
  oninput(elements, callback) {
    if (this.FuncRules) {
      this.Funcs.getElementInElements(elements, (name, element) => {
        element.oninput = () => {
          let isRequired = this.Funcs.getNameFunc(name, 'required');
          let msg = undefined;
          let value = element.value;
          let type = element.getAttribute('type');
          switch (type) {
            case 'radio':
              let eRadios = element.querySelectorAll('[name][type]');
              value = [...eRadios].some(e => e.checked);
              this.FuncRules[name].some(func => {
                return (msg = func(value));
              });
              break;
            case 'checkbox':
              let eCheckboxs = element.querySelectorAll('[name][type]');
              value = [...eCheckboxs].reduce((totalvalue, e) => {
                return e.checked ? [...totalvalue, e.value] : totalvalue;
              }, []);
              this.FuncRules[name].some(func => {
                return (msg = func(value));
              });
              break;
            default:
              this.FuncRules[name].some(func => {
                return (msg = func(value.trim()));
              });
              break;
          }
          if (!isRequired && value.trim() === '') {
            msg = '';
          }
          callback(name, msg);
        }
      });
    }
  }
};

const Validator = {
  Funcs: ValidatorFuncs,
  Events: ValidatorEvents,

  nameRules: {},
  funcRules: {},
  msgRules: {},

  eBoxRules: {},
  eMessageRules: {},

  eForm: undefined,
  eBoxs: undefined,
  eMessages: undefined,
  eInputs: undefined,
  eRadios: undefined,

  init(formSelector) {
    this.eForm = $(formSelector);
    if (this.eForm) {
      this.eBoxs = this.eForm.querySelectorAll('[name][validate-boxs]');
      this.eMessages = this.eForm.querySelectorAll('[name][validate-messages]');
      this.eInputs = this.eForm.querySelectorAll('[name][validate-rules]');

      this.initElements();
      this.handleEvents();
    }
  },

  initElements() {
    this.Funcs.NameRules = this.nameRules;

    this.Funcs.getElementInElements(this.eBoxs, (name, element) => {
      this.eBoxRules[name] = element;
    });
    //console.log(this.eBoxRules);

    this.Funcs.getElementInElements(this.eMessages, (name, element) => {
      this.eMessageRules[name] = element;
    });
    //console.log(this.eMessageRules);

    this.Funcs.getMessageInRules(this.eMessages, (name, rules) => {
      this.msgRules[name] = rules;
    });
    //console.log(this.msgRules);

    this.Funcs.getFuncInRules(this.eInputs, this.msgRules, (name, rules) => {
      this.funcRules[name] = rules;
    });
    //console.log(this.funcRules);

    this.Funcs.getNameInRules(this.eInputs, (name, rules) => {
      this.nameRules[name] = rules;
    });
    //console.log(nameRules);
  },

  handleEvents() {
    this.Events.NameRules = this.nameRules;
    this.Events.FuncRules = this.funcRules;

    this.Events.onblur(this.eInputs, (name, msg) => {
      this.Funcs.setMessage(this.eBoxRules[name], this.eMessageRules[name], msg);
    });

    this.Events.oninput(this.eInputs, (name, msg) => {
      this.Funcs.setMessage(this.eBoxRules[name], this.eMessageRules[name], msg);
    });
  },

  getDataSubmit(callback) {
    this.Events.onsubmit(this.eInputs, (name, msg) => {
      this.Funcs.setMessage(this.eBoxRules[name], this.eMessageRules[name], msg);
    }, results => {
      callback(results);
    });
  }
}