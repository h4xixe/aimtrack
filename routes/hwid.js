const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Log do header bruto
  console.log("🪪 Header Authorization recebido:", authHeader);

  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.warn("⚠️ Nenhum token JWT foi enviado.");
    return res.status(401).json({ error: 'JWT token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ JWT decodificado com sucesso:", decoded);
    req.userId = decoded.userId || decoded.licenseId;
    next();
  } catch (error) {
    console.error('❌ Falha ao verificar JWT:', error.message);
    console.warn("🛑 Token recebido:", token);
    return res.status(401).json({ error: 'Invalid or expired JWT token' });
  }
}


router.get('/hwid', verifyJWT, async (req, res) => {
  try {
   const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || !user.hwid) {
      return res.status(404).json({ error: 'HWID não encontrado' });
    }

    console.log(`📥 HWID solicitado por usuário: ${user.username}, IP: ${req.ip}`);
    res.json({ hwid: user.hwid });

  } catch (error) {
    console.error('❌ Erro ao buscar HWID:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;