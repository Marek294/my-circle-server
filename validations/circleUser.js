const isEmpty = require('lodash/isEmpty');

module.exports = data => {
  let errors = {};
  if(!("circleId" in data)) errors.circleId = "This field is required";

  if(!("userId" in data)) errors.userId = "This field is required";

  if(!("isAdmin" in data)) errors.isAdmin = "This field is required";

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
