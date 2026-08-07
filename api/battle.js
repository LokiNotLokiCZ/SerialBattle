import { createClient } from 'redis';

let client;

function getClient() {
    if (!client) {
        client = createClient({
            url: process.env.REDIS_URL
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
    }
    return client;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const channel = req.query.channel || (req.body && req.body.channel);
    if (!channel) {
        return res.status(400).json({ error: 'Missing channel' });
    }

    const key = 'battle_' + channel.toLowerCase();
    const redisClient = getClient();

    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        if (req.method === 'GET') {
            const dataStr = await redisClient.get(key);
            const data = dataStr
                ? JSON.parse(dataStr)
                : { shows: [], status: 'lobby', currentPair: [0, 1], votes: { 1: 0, 2: 0 }, votedUsers: [] };
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            // Frontend sends { channel, data }. Unwrap it so we only ever
            // store the actual battle state, not the wrapper object.
            const newData = (req.body && req.body.data !== undefined) ? req.body.data : req.body;
            await redisClient.set(key, JSON.stringify(newData));
            return res.status(200).json(newData);
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

    return res.status(405).end();
}
