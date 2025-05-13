module.exports = (req, res, next) => {
    try {
        const forwardedIps = req.headers['x-forwarded-for'];
        const ip = typeof forwardedIps === 'string' 
            ? forwardedIps.split(',')[0].trim() 
            : req.socket.remoteAddress;
        
        req.clientIp = ip;
        
        next();
    } catch (error) {
        console.error('Error processing client IP:', error);
        next();
    }
};