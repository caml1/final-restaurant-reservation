function isDate(dateString) {
    return !isNaN(Date.parse(dateString));
  }
  
  function isTime(timeString) {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
  }
  
  module.exports = {
    isDate,
    isTime,
  };