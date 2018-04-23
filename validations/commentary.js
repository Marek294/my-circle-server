const Validator = require('validator');
const isEmpty = require('lodash/isEmpty');

module.exports = data => {
  let errors = {};

  if(!("postId" in data)) errors.postId = "This field is required";

  if(!("content" in data) || Validator.isEmpty(data.content)) errors.content = "This field is required";

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
