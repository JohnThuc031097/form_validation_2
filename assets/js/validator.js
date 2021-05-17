const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const ValidatorRules = (() => {
  return {
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
})

const ValidatorFuncs = (() => {
  const _rules = ValidatorRules();
  let _nameRules = undefined;
  return {
    init(nameRules) {
      _nameRules = nameRules;
    },
    getNameFunc(nameRule, nameFunc) {
      return _nameRules[nameRule].some(name => name === nameFunc);
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
            funcRules.push(_rules[ruleInfo[0]](msgRules[name][index])(ruleInfo[1]));
          } else {
            funcRules.push(_rules[rule](msgRules[name][index]));
          }
        });
        callback(name, funcRules);
      });
    }
  }
})

const ValidatorEvents = (() => {
  const _funcs = ValidatorFuncs();
  let _funcRules = undefined;
  let _nameRules = undefined;

  return {
    init(funcRules, nameRules) {
      _funcRules = funcRules;
      _nameRules = nameRules;
      _funcs.init(_nameRules);
    },
    onblur(elements, callback) {
      if (_funcRules) {
        _funcs.getElementInElements(elements, (name, element) => {
          let isRequired = _funcs.getNameFunc(name, 'required');
          if (isRequired) {
            element.onblur = () => {
              let msg = undefined;
              _funcRules[name].some(func => {
                return (msg = func(element.value.trim()));
              });
              callback(name, msg);
            }
          }
        });
      }
    },
    oninput(elements, callback) {
      if (_funcRules) {
        _funcs.getElementInElements(elements, (name, element) => {
          element.oninput = () => {
            let isRequired = _funcs.getNameFunc(name, 'required');
            let msg = undefined;
            let value = element.value;
            let type = element.getAttribute('type');
            switch (type) {
              case 'radio':
                let eRadios = element.querySelectorAll('[name][type]');
                value = [...eRadios].some(e => e.checked);
                _funcRules[name].some(func => {
                  return (msg = func(value));
                });
                break;
              case 'checkbox':
                let eCheckboxs = element.querySelectorAll('[name][type]');
                value = [...eCheckboxs].reduce((totalvalue, e) => {
                  return e.checked ? [...totalvalue, e.value] : totalvalue;
                }, []);
                _funcRules[name].some(func => {
                  return (msg = func(value));
                });
                break;
              default:
                _funcRules[name].some(func => {
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
    },
    onsubmit(elements, callbackMsg, calbackResults) {
      if (_funcRules) {
        let acceptSubmit = true;
        let dataSubmit = {};
        _funcs.getElementInElements(elements, (name, element) => {
          let isRequired = _funcs.getNameFunc(name, 'required');
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
                _funcRules[name].some(func => {
                  return (msg = func(!value && ''));
                });
                break;
              case 'checkbox':
                let eCheckboxs = element.querySelectorAll('[name][type]');
                value = [...eCheckboxs].reduce((totalvalue, e) => {
                  return e.checked ? [...totalvalue, e.value] : totalvalue;
                }, []);
                _funcRules[name].some(func => {
                  return (msg = func(value.length > 0 && value || ''));
                });
                break;
              default:
                _funcRules[name].some(func => {
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
  }
})

const Validator = (() => {
  const _funcs = ValidatorFuncs();
  const _events = ValidatorEvents();

  const _nameRules = {};
  const _funcRules = {};
  const _msgRules = {};

  const _eBoxRules = {};
  const _eMessageRules = {};

  let _eForm = undefined;
  let _eBoxs = undefined;
  let _eMessages = undefined;
  let _eInputs = undefined;

  function _initElements() {

    _funcs.getElementInElements(_eBoxs, (name, element) => {
      _eBoxRules[name] = element;
    });
    //console.log(this.eBoxRules);

    _funcs.getElementInElements(_eMessages, (name, element) => {
      _eMessageRules[name] = element;
    });
    //console.log(this.eMessageRules);

    _funcs.getMessageInRules(_eMessages, (name, rules) => {
      _msgRules[name] = rules;
    });
    //console.log(this.msgRules);

    _funcs.getFuncInRules(_eInputs, _msgRules, (name, rules) => {
      _funcRules[name] = rules;
    });
    //console.log(this.funcRules);

    _funcs.getNameInRules(_eInputs, (name, rules) => {
      _nameRules[name] = rules;
    });
    //console.log(nameRules);
  }

  function _handleEvents() {
    _events.onblur(_eInputs, (name, msg) => {
      _funcs.setMessage(_eBoxRules[name], _eMessageRules[name], msg);
    });

    _events.oninput(_eInputs, (name, msg) => {
      _funcs.setMessage(_eBoxRules[name], _eMessageRules[name], msg);
    });
  }

  return {
    init(formSelector) {
      _eForm = $(formSelector);
      if (_eForm) {
        _eBoxs = _eForm.querySelectorAll('[name][validate-boxs]');
        _eMessages = _eForm.querySelectorAll('[name][validate-messages]');
        _eInputs = _eForm.querySelectorAll('[name][validate-rules]');

        _funcs.init(_nameRules);
        _initElements();

        _events.init(_funcRules, _nameRules);
        _handleEvents();
      }
    },
    getFormElement() {
      return _eForm;
    },
    getDataSubmit(callback) {
      _events.onsubmit(_eInputs, (name, msg) => {
        _funcs.setMessage(_eBoxRules[name], _eMessageRules[name], msg);
      }, results => {
        callback(results);
      });
    }
  }
});