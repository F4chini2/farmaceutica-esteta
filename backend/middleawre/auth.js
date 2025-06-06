const jwt = require('jsonwebtoken');
const SECRET = 'chave-super-secreta';

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // O token vem no formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });

    req.usuario = usuario; // salva os dados do token no req
    next();
  });
};

module.exports = autenticarToken;
