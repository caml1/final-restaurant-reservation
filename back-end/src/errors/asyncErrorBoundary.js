function asyncErrorBoundary(delegate, defaultStatus) {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => delegate(req, res, next))
      .catch((error = {}) => {
        const { status = defaultStatus, message = error.message } = error;
        next({
          status,
          message,
        });
      });
  };
}

module.exports = asyncErrorBoundary;