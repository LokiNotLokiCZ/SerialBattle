import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const channel = req.query.channel;
    if (!channel) {
        return res.status(400).json({ error: 'Missing channel' });
    }

    const key = 'battle_' + channel.toLowerCase();

    try {
        if (!client.isOpen) {
            await client.connect();
        }

        if (req.method === 'GET') {
            const dataStr = await client.get(key);
            const data = dataStr ? JSON.parse(dataStr) : { shows: [], status: 'lobby', currentPair: [0, 1], votes: { 1: 0, 2: 0 }, votedUsers: [] };
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const newData = req.body;
            await client.set(key, JSON.stringify(newData));
            return res.status(200).json({ success: true });
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

    return res.status(405).end();
}