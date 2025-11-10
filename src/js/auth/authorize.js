/*
* Check if the ip is white listed or if there is a valid api key, then apply rate limiting
* */

const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
const API_KEY = process.env.API_KEY || null;
const SERVER_IP = process.env.SERVER_IP; // Set this in your .env file


const rateLimitMap = new Map(); // In-memory store

function rateLimit(req, res, next) {
    let clientIP =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;

    if (clientIP.startsWith('::ffff:')) clientIP = clientIP.replace('::ffff:', '');

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    // Different limits based on origin
    const isServer = clientIP === SERVER_IP;
    const maxRequests = isServer ? 10 : 2;

    const entry = rateLimitMap.get(clientIP) || { count: 0, startTime: now };

    if (now - entry.startTime > windowMs) {
        // Reset window
        rateLimitMap.set(clientIP, { count: 1, startTime: now });
        return next();
    }

    if (entry.count < maxRequests) {
        entry.count += 1;
        rateLimitMap.set(clientIP, entry);
        return next();
    }

    console.warn(`Rate limit exceeded for ${clientIP}`);
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
}


function authorize(req, res, next) {
    let requestIP = req.socket.remoteAddress;

    // Normalize IPv6 -> IPv4
    if (requestIP.startsWith('::ffff:')) requestIP = requestIP.replace('::ffff:', '');

    console.log('Incoming IP:', requestIP);

    const apiKeyHeader = req.headers['x-api-key'];

    // API key override
    if (API_KEY && apiKeyHeader === API_KEY) return next();

    // Trust localhost
    const localIPs = ['127.0.0.1', '::1'];
    if (localIPs.includes(requestIP)) return next();

    // Whitelist check
    if (ALLOWED_IPS.includes(requestIP)) return next();

    console.warn(`Unauthorized request from ${requestIP}`);
    return res.status(403).json({ error: 'Access denied' });
}


module.exports = { authorize };
