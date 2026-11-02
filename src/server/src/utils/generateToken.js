const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'customer') => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_amazon_key_2026_secure';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
