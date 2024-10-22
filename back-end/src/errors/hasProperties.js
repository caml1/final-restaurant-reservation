function hasProperties(...properties) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      
      for (let property of properties) {
        if (!data[property]) {
          return next({
            status: 400,
            message: `A '${property}' field is required.`,
          });
        }
      }
      next();
    };
  }
  
  module.exports = hasProperties;