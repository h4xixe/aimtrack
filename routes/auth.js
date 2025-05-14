const express = require('express');
const chalk = require('chalk');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const AuthProduct = require('../models/AuthProduct');
const User = require('../models/User');
const License = require('../models/License');
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const rateLimit = require('../middleware/rateLimit');
const getIp = require('../middleware/getIp');
const cors = require('cors');
const axios = require('axios');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed`));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'WYZ';
    for (let block = 0; block < 3; block++) {
        key += '-';
        for (let i = 0; i < 4; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    return key; //-XXXX-XXXX-XXXX
}

function requireAuthToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const expectedToken = `Bearer ${process.env.API_AUTH_TOKEN || '575a101fd4fcdc8dbcd070e188cf0fe52353fbad0612572ae82f4701a891181b'}`;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is required' });
    }
    if (authHeader !== expectedToken) {
        return res.status(401).json({ error: 'Invalid authorization token' });
    }

    next();
}
function verifyJWT(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'JWT token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId || decoded.licenseId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired JWT token' });
    }
}

function verifyRisePayToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const expectedToken = `Bearer ${process.env.RISE_PAY_TOKEN}`;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is required' });
    }
    if (authHeader !== expectedToken) {
        return res.status(401).json({ error: 'Invalid authorization token' });
    }
    next();
}

router.get('/', rateLimit, getIp, async (req, res) => {
    try {
        console.log(chalk.green('✅ [API] Authorization:'), chalk.yellow(req.headers['authorization']));
        console.log(chalk.cyan('ℹ️ Token recebido com sucesso.'));
        res.send('api by nash (85hz)');
    } catch (error) {
        console.error(chalk.red('❌ Erro na rota /api/:'), error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/logout', verifyJWT, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

     const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

    const user1 = req.user;

    await Session.deleteOne({ token });

    console.log(`🔓 Logout realizado para usuário: ${user.username}, IP: ${req.ip}`);

    res.json({ status: 'success' });
  } catch (error) {
    console.error(`❌ Erro ao fazer logout para IP: ${req.ip} ->`, error);
    res.status(500).json({ error: 'Logout failed' });
  }
});


router.get('/init', rateLimit, getIp, async (req, res) => {
    try {
        const { product } = req.query;
        console.log(chalk.blue('📋 Received product ID:'), chalk.white(product));
        console.log(chalk.green('📋 Authorization:'), chalk.yellow(req.headers['authorization']));
        
        if (!product) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        if (!/^#\d{6}$/.test(product)) {
            return res.status(400).json({ error: 'Invalid Product ID format. Use # followed by 6 digits (e.g., #123456)' });
        }

        const productData = await AuthProduct.findOne({ productId: product });
        if (!productData) { 
            return res.status(404).json({ error: `Product with ID ${product} not found` });
        }

        if (productData.status === 'paused') {
            return res.status(403).json({ error: 'Product is paused' });
        }

        res.json({
            status: 'success',
            product: {
                id: productData.productId,
                name: productData.name,
                status: productData.status
            }
        });
    } catch (error) {
        console.log(chalk.red('❌ Error in /api/init:'), chalk.white(error.message, error.stack));
       // console.error('❌ Error in /api/init:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register', rateLimit, getIp, async (req, res) => {
   try {
        const { username, password, email, license, hwid, resetsAvailable } = req.body;

        if (!username || !password || !email || !license) {
            return res.status(400).json({ error: 'Username, password, email, and license key are required' });
        }
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            return res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters' });
        }
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const licenseData = await License.findOne({ key: license });
        if (!licenseData) {
            return res.status(404).json({ error: 'Invalid license key' });
        }
        if (licenseData.banned) {
            return res.status(403).json({ error: 'License is banned' });
        }
        if (licenseData.expiry < new Date()) {
            return res.status(403).json({ error: 'License has expired' });
        }
        if (licenseData.userId) {
            return res.status(400).json({ error: 'License is already linked to a user' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        const user = new User({
            username,
            password: password,
            email,
            licenseKey: license,
            ip: req.clientIp,
            hwid,
            resetsAvailable
        });
        await user.save();

        licenseData.userId = user._id;
        licenseData.ip = req.clientIp;
        if (hwid && !licenseData.hwid) licenseData.hwid = hwid;
        await licenseData.save();

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });

        const session = new Session({
            token,
            userId: user._id,
            expiry: new Date(Date.now() + 3600 * 1000),
            ip: req.clientIp,
            hwid,
            resetsAvailable
        });
        await session.save();

        res.json({
            status: 'success',
            token,
            user: {
                username: user.username,
                email: user.email,
                licenseKey: user.licenseKey
            }
        });
    } catch (error) {
        console.error('❌ Error in /api/register:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/reset', requireAuthToken, async (req, res) => {
  try {
    const userId = req.user.userId; // extraído do JWT
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    if (user.resetsAvailable <= 0) {
      return res.status(403).json({ status: 'error', error: 'No resets available' });
    }

    // Zera o HWID e reduz o número de resets disponíveis
    user.hwid = null;
    user.resetsAvailable -= 1;
    await user.save();

    return res.json({ status: 'success' });
  } catch (err) {
    console.error('❌ Error resetting HWID:', err.message);
    return res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

router.post('/auth', rateLimit, requireAuthToken, getIp, async (req, res) => {
    try {
        const { user, pass } = req.body;

        if (!user || !pass) {
            return res.status(400).json({ 
                error: 'Username and password are required',
                status: 'error'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Busca o usuário no banco de dados
        const userData = await User.findOne({ username: user });
        
        // Verificação simplificada sem bcrypt
        if (!userData || userData.password !== pass) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (userData.banned) {
            return res.status(403).json({ error: 'User is banned' });
        }

        // Atualiza apenas o IP do usuário
        userData.ip = req.clientIp;
        await userData.save();

        // Gera o token JWT
        const token = jwt.sign({ userId: userData._id }, secret, { expiresIn: '1h' });

        // Cria a sessão
        const sessionData = { 
            token,
            userId: userData._id,
            expiry: new Date(Date.now() + 3600 * 1000),
            ip: req.clientIp
        };
        
        const session = new Session(sessionData);
        await session.save();

        res.json({
            status: 'success',
            token,
            user: {
                username: userData.username,
                email: userData.email
            }
        });

    } catch (error) {
        console.error('❌ Error in /api/login:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/authapp', rateLimit, getIp, async (req, res) => {
    try {
        const { user, pass, hwid } = req.body;  // Inclui o hwid no corpo da requisição

        if (!user || !pass || !hwid) {
            return res.status(400).json({ 
                error: 'Username, password, and hwid are required',
                status: 'error'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Busca o usuário no banco de dados
        const userData = await User.findOne({ username: user });
        
        // Verificação simplificada sem bcrypt
        if (!userData || userData.password !== pass) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (userData.banned) {
            return res.status(403).json({ error: 'User is banned' });
        }

        // Se o HWID é diferente, atualize o campo hwid
        if (userData.hwid !== hwid) {
            userData.hwid = hwid;  // Atualiza o hwid
            await userData.save();
        }

        // Atualiza o IP do usuário
        userData.ip = req.clientIp;
        await userData.save();

        // Gera o token JWT
        const token = jwt.sign({ userId: userData._id }, secret, { expiresIn: '1h' });

        // Cria a sessão
        const sessionData = { 
            token,
            userId: userData._id,
            expiry: new Date(Date.now() + 3600 * 1000),
            ip: req.clientIp
        };
        
        const session = new Session(sessionData);
        await session.save();

        res.json({
            status: 'success',
            token,
            user: {
                username: userData.username,
                email: userData.email
            }
        });

    } catch (error) {
        console.error('❌ Error in /api/login:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/login', rateLimit, requireAuthToken, getIp, async (req, res) => {
    try {
        const { user, pass, license, hwid } = req.body;
        

        if (!hwid) {
            return res.status(400).json({ 
                error: 'HWID is required',
                status: 'error'
            });
        }

        if ((user || pass) && license) {
            return res.status(400).json({ error: 'Provide either username/password or license key, not both' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        let token;
        let sessionData = { ip: req.clientIp, hwid, expiry: new Date(Date.now() + 3600 * 1000) };

        if (user && pass) {
            // Login with username and password
            const userData = await User.findOne({ username: user });
            if (!userData || !(await bcrypt.compare(pass, userData.password))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            if (userData.banned) {
                return res.status(403).json({ error: 'User is banned' });
            }
            if (userData.hwid && userData.hwid !== hwid) {
                return res.status(403).json({ error: 'HWID mismatch' });
            }

            // Update user IP and HWID
            userData.ip = req.clientIp;
            if (!userData.hwid) userData.hwid = hwid;
            await userData.save();

            // Generate JWT for user
            token = jwt.sign({ userId: userData._id }, secret, { expiresIn: '1h' });

            // Create session
            sessionData.token = token;
            sessionData.userId = userData._id;
            const session = new Session(sessionData);
            await session.save();

            res.json({
                status: 'success',
                token,
                user: {
                    username: userData.username,
                    email: userData.email
                }
            });
        } else if (license) {
            // Login with license key
            const licenseData = await License.findOne({ key: license });
            if (!licenseData) {
                return res.status(404).json({ error: 'Invalid license key' });
            }
            if (licenseData.banned) {
                return res.status(403).json({ error: 'License is banned' });
            }
            if (licenseData.expiry < new Date()) {
                return res.status(403).json({ error: 'License has expired' });
            }
            if (licenseData.hwid && licenseData.hwid !== hwid) {
                return res.status(403).json({ error: 'HWID mismatch' });
            }

            // Update license IP and HWID
            licenseData.ip = req.clientIp;
            if (!licenseData.hwid) licenseData.hwid = hwid;
            await licenseData.save();

            // Generate JWT for license
            token = jwt.sign({ licenseId: licenseData._id }, secret, { expiresIn: '1h' });

            // Create session
            sessionData.token = token;
            sessionData.licenseId = licenseData._id;
            const session = new Session(sessionData);
            await session.save();

            res.json({
                status: 'success',
                token,
                license: {
                    key: licenseData.key,
                    expiry: licenseData.expiry
                }
            });
        } else {
            return res.status(400).json({ error: 'Username/password or license key required' });
        }
    } catch (error) {
        console.error('❌ Error in /api/login:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/profile', verifyJWT, upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.files.profilePicture) {
            user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
               console.log("Nova URL recebida (profile):", req.files.profilePicture[0].filename);
        }
        if (req.files.banner) {
            user.banner = `/uploads/${req.files.banner[0].filename}`;
            console.log("Nova URL recebida (Banner):", req.files.banner[0].filename);
        }
        await user.save();

        res.json({
            status: 'success',
            user: {
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                banner: user.banner,
                discordId: user.discordId
            }
        });
        console.log("Imagem sendo usada no Avatar:", user.profilePicture);
         console.log("Imagem sendo usada no Banner:", user.banner);
    } catch (error) {
        console.error('❌ Error in /api/profile:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/profile', verifyJWT, async (req, res) => {
   try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const license = await License.findOne({ userId: user._id });
        if (!license) {
            return res.status(404).json({ error: 'License not found' });
        }

        console.log(user.hwid);
        res.json({
    status: 'success',
    user: {
        username: user.username,
        email: user.email,
        licenseKey: user.licenseKey,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        discordCreateDate: user.discordCreateDate,
        discordAvatar: user.discordAvatar,
        profilePicture: user.profilePicture,
        banner: user.banner,
        hwid: user.hwid,
        resetsAvailable: user.resetsAvailable,
        expiry: license?.expiry || null
    }
});

    } catch (error) {
        console.error('❌ Error in /api/profile:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/discord', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://api.aimtrack.pro/api/discord/callback');
    const scope = encodeURIComponent('identify');
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`);
});
router.get('/discord/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: 'https://api.aimtrack.pro/api/discord/callback',
                scope: 'identify'
            })
        });

        if (!tokenResponse.ok) {
            throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            return res.status(400).json({ error: 'Failed to obtain access token' });
        }

        // Fetch Discord user data
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        if (!userResponse.ok) {
            throw new Error(`Failed to fetch user data: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();
        if (!userData.id) {
            return res.status(400).json({ error: 'Failed to fetch Discord user data' });
        }

        // Calculate creation date from Discord ID (first 8 characters are timestamp)
        const discordCreateDate = new Date(parseInt(userData.id.substring(0, 8), 16) * 1000).toISOString();

        // Avatar URL (Discord provides this; banner requires additional scope)
        const avatarUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
            : null;

        // Check if user exists (e.g., by IP or create new user)
        let user = await User.findOne({ ip: req.clientIp });
        if (!user) {
            // Create new user if not found
            user = new User({
                username: `discord_${userData.id}`, // Temporary username
                email: `${userData.id}@discord.temp`, // Temporary email
                discordId: userData.id,
                discordUsername: userData.username,
                discordCreateDate,
                discordAvatar: avatarUrl,
                ip: req.clientIp
            });
            await user.save();

            // Generate a license for the new user (optional)
            const license = new License({
                key: generateLicenseKey(),
                productId: '#123456', // Default product ID
                expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                userId: user._id,
                discordId: userData.id,
                discordUsername: userData.username,
                discordCreateDate,
                discordAvatar: avatarUrl
            });
            await license.save();
        } else {
            // Update existing user
            user.discordId = userData.id;
            user.discordUsername = userData.username;
            user.discordCreateDate = discordCreateDate;
            user.discordAvatar = avatarUrl;
            await user.save();

            // Update associated license if exists
            const license = await License.findOne({ userId: user._id });
            if (license) {
                license.discordId = userData.id;
                license.discordUsername = userData.username;
                license.discordCreateDate = discordCreateDate;
                license.discordAvatar = avatarUrl;
                await license.save();
            }
        }

        // Generate JWT token for the user
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });

        // Redirect to localhost:3001 with Discord data and token
        const queryParams = new URLSearchParams({
            token: token,
            discordId: userData.id,
            discordUsername: userData.username,
            discordCreateDate: discordCreateDate,
            discordAvatar: avatarUrl || '',
            discordBanner: '' // Placeholder; requires additional scope
        }).toString();
        res.redirect(`http://localhost:3001?${queryParams}`);
    } catch (error) {
        console.error('❌ Error in /api/discord/callback:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/payments/generate', rateLimit, verifyJWT, async (req, res) => {
    try {
        const { amount, payment = {}, metadata = {} } = req.body;
        const userId = req.userId;

        // Validações básicas
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        if (!process.env.RISE_PAY_URL || !process.env.RISE_PAY_TOKEN) {
            console.error('❌ RisePay configuration missing in .env');
            return res.status(500).json({ error: 'Payment configuration unavailable' });
        }

        // Buscar informações do usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Dados para a API do RisePay
        const payload = {
            amount,
            payment: {
                method: 'pix',
                expiresAt: payment.expiresAt || 48 // Expira em 48 horas por padrão
            },
            customer: {
                name: user.username,
                email: user.email,
                // Adicione outros campos conforme necessário (CPF, telefone, etc.)
            },
            metadata: {
                ...metadata,
                userId: user._id.toString(),
                licenseKey: user.licenseKey
            }
        };

        // Chamada para a API do RisePay
        const response = await axios.post(process.env.RISE_PAY_URL, payload, {
            headers: {
                Authorization: process.env.RISE_PAY_TOKEN,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const pixData = response.data?.object?.pix;
        if (!pixData?.qrCode) {
            console.error('❌ PIX code missing in RisePay response:', JSON.stringify(response.data, null, 2));
            return res.status(500).json({ error: 'Failed to generate PIX code' });
        }

        // Salvar o pagamento no banco de dados
        const paymentRecord = new Payment({
            userId: user._id,
            amount,
            currency: 'BRL',
            method: 'pix',
            status: 'pending',
            provider: 'risepay',
            providerId: response.data.object.id,
            pixCode: pixData.qrCode,
            expiresAt: new Date(Date.now() + (payload.payment.expiresAt * 60 * 60 * 1000)),
            metadata
        });
        await paymentRecord.save();

        // Retornar os dados do pagamento
        res.json({
            status: 'success',
            object: {
                id: paymentRecord._id,
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                status: paymentRecord.status,
                pix: {
                    qrCode: paymentRecord.pixCode,
                    expiresAt: paymentRecord.expiresAt
                },
                metadata: paymentRecord.metadata
            }
        });

    } catch (error) {
        console.error('❌ Error in /payments/generate:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to generate payment',
            details: error.response?.data?.message || error.message
        });
    }
});

// Endpoint para verificar status do pagamento
router.get('/payments/:id', rateLimit, verifyJWT, async (req, res) => {
    try {
        const paymentId = req.params.id;
        const userId = req.userId;

        const payment = await Payment.findOne({ _id: paymentId, userId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Se necessário, verificar status atualizado com o RisePay
        // (implementação opcional)

        res.json({
            status: 'success',
            object: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                status: payment.status,
                createdAt: payment.createdAt,
                expiresAt: payment.expiresAt,
                metadata: payment.metadata
            }
        });

    } catch (error) {
        console.error('❌ Error in /payments/:id:', error.message);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});

// Webhook para receber notificações do RisePay
router.post('/payments/webhook', verifyRisePayToken, async (req, res) => {
    try {
        const { event, object } = req.body;

        if (event !== 'payment.updated') {
            return res.status(400).json({ error: 'Unsupported event type' });
        }

        // Atualizar o status do pagamento no banco de dados
        const payment = await Payment.findOneAndUpdate(
            { providerId: object.id },
            { 
                status: object.status,
                $set: {
                    'metadata.providerData': object
                }
            },
            { new: true }
        );

        if (!payment) {
            console.error('❌ Payment not found for webhook:', object.id);
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Se o pagamento foi confirmado, atualizar a licença do usuário
        if (object.status === 'paid' && payment.userId) {
            const license = await License.findOne({ userId: payment.userId });
            if (license) {
                // Adicionar tempo à licença com base no valor pago
                let daysToAdd = 30; // Padrão 30 dias para pagamentos sem plano específico
                
                // Verificar se é um plano anual (R$ 100,00)
                if (payment.amount === 100) {
                    daysToAdd = 365;
                }
                
                // Atualizar data de expiração
                const newExpiry = new Date(Math.max(
                    new Date(license.expiry).getTime(),
                    Date.now()
                ) + (daysToAdd * 24 * 60 * 60 * 1000));
                
                license.expiry = newExpiry;
                await license.save();

                console.log(`✅ License extended for user ${payment.userId} until ${newExpiry}`);
            }
        }

        res.json({ status: 'success' });

    } catch (error) {
        console.error('❌ Error in /payments/webhook:', error.message);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});

// Endpoint para listar pagamentos do usuário
router.get('/payments', rateLimit, verifyJWT, async (req, res) => {
    try {
        const userId = req.userId;
        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            status: 'success',
            objects: payments.map(p => ({
                id: p._id,
                amount: p.amount,
                currency: p.currency,
                method: p.method,
                status: p.status,
                createdAt: p.createdAt,
                expiresAt: p.expiresAt
            }))
        });

    } catch (error) {
        console.error('❌ Error in /payments:', error.message);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Serve dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

router.use((err, req, res, next) => {
  console.error(chalk.red('❌ Error:'), err.stack);
  res.status(500).json({ 
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
});

module.exports = router;