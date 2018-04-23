const Validator = require('validator');
const isEmpty = require('lodash/isEmpty');

module.exports = data => {
  let errors = {};
  if(!("circleId" in data)) errors.circleId = "This field is required";

  if(Validator.isEmpty(data.title)) errors.title = "This field is required";

  if(Validator.isEmpty(data.content)) errors.content = "This field is required";

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
