module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/userAuth',
  jwtSecret: process.env.JWT_SECRET || '........',
  jwtExpiration: '24h'
};
