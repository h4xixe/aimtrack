const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'JWT token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.licenseId;
    next();
  } catch (error) {
    console.error('❌ Falha ao verificar JWT:', error.message);
    return res.status(401).json({ error: 'Invalid or expired JWT token' });
  }
}

router.post('/resethwid', verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.resetsAvailable !== undefined && user.resetsAvailable <= 0) {
      return res.status(403).json({ error: 'Sem resets restantes' });
    }

    user.hwid = '';
    user.resetsAvailable = (user.resetsAvailable || 2) - 1;
    await user.save();
    console.log(`🔄 Reset de HWID solicitado para usuário: ${user.username}, IP: ${req.ip}`);
    return res.json({ success: true, resetsRemaining: user.resetsAvailable });
  } catch (err) {
    console.error('❌ Erro ao resetar HWID:', err);
    return res.status(500).json({ error: 'Erro interno ao resetar HWID' });
  }
});

module.exports = router;
