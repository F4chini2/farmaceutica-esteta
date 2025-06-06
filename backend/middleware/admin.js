const adminOnly = (req, res, next) => {
  if (req.usuario && req.usuario.tipo === 'admin') {
    return next(); // Libera o acesso
  }

  return res.status(403).json({ erro: 'Acesso restrito a administradores' });
};

module.exports = adminOnly;
