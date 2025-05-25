
module.exports = function(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0 && !req.is('multipart/form-data')) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    console.log('Request Body:', JSON.stringify(sanitizedBody));
  }
  
  next();
};
