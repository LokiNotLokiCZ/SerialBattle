// Jednoduchá paměťová databáze běžící přímo na Vercel serveru
let storage = {};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const channel = req.query.channel || (req.body && req.body.channel);
    if (!channel) {
        return res.status(400).json({ error: 'Chybí kanál' });
    }

    const channelKey = channel.toLowerCase();

    if (req.method === 'GET') {
        const data = storage[channelKey] || {
            shows: [],
            status: 'lobby',
            currentPair: [0, 1],
            votes: { 1: 0, 2: 0 },
            votedUsers: []
        };
        return res.status(200).json(data);
    }

    if (req.method === 'POST') {
        const newData = req.body.data;
        if (newData) {
            storage[channelKey] = newData;
            return res.status(200).json(newData);
        }
        return res.status(400).json({ error: 'Chybí data' });
    }

    return res.status(405).end();
}