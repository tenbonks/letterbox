/*
* Check if the ip isu white listed or there is a valid api key
* */

const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
const API_KEY = process.env.API_KEY || null;

function authorize(req, res, next) {
    let requestIP =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;

    // normalize IPv6 -> IPv4 where needed
    if (requestIP.startsWith('::ffff:')) requestIP = requestIP.replace('::ffff:', '');

    console.log('Incoming IP:', requestIP);

    const apiKeyHeader = req.headers['x-api-key'];

    // 1️⃣ Allow API key override
    if (API_KEY && apiKeyHeader === API_KEY) return next();

    // 2️⃣ Always trust localhost connections (internal services)
    const localIPs = ['127.0.0.1', '::1'];
    if (localIPs.includes(requestIP)) return next();

    // 3️⃣ Otherwise, check against whitelist
    if (ALLOWED_IPS.includes(requestIP)) return next();

    console.warn(`Unauthorized request from ${requestIP}`);
    return res.status(403).json({ error: 'Access denied' });

}

module.exports = { authorize };
