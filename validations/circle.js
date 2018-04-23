const Validator = require('validator');
const isEmpty = require('lodash/isEmpty');

module.exports = data => {
  let errors = {};
  if(Validator.isEmpty(data.name)) errors.name = "This field is required";

  if(!("isPublic" in data)) errors.isPublic = "This field is required";

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
