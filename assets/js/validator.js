const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const ValidatorRules = {
  required(value) {
    return value && undefined || 'Vui lòng nhập trường này';
  },
  email(value) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(value).toLowerCase()) && undefined || 'Email không hợp lệ';
  },
  min(value) {
    return value.length <= min && undefined || 'Độ dài chuỗi vượt quá qui định';
  },
}

const Validator = (formSelector) => {
  let formRules = {};


  let eForm = $(formSelector);
  if (eForm) {
    let eInput = eForm.querySelectorAll('[name][rules]');
    eInput.forEach(e => {
      formRules[e.name] = e.getAttribute('rules');
    });
    console.log(formRules);
  }
}