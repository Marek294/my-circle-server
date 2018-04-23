const Validator = require('validator');
const isEmpty = require('lodash/isEmpty');

module.exports = data => {
  let errors = {};

  if(!("postId" in data)) errors.postId = "This field is required";

  if(data.voteType != "plus" && data.voteType != "minus") errors.voteType = "This field only accept values 'plus' or 'minus'";

  if(!("voteType" in data) || Validator.isEmpty(data.voteType)) errors.voteType = "This field is required";

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
