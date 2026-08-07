export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const title = req.query.title;
    if (!title) {
        return res.status(400).json({ error: 'Missing title' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured' });
    }

    try {
        const query = encodeURIComponent(title + ' official trailer');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${apiKey}`;

        const ytRes = await fetch(url);
        const ytJson = await ytRes.json();

        if (ytJson.error) {
            return res.status(502).json({ error: ytJson.error.message || 'YouTube API error' });
        }

        const item = ytJson.items && ytJson.items[0];
        if (!item || !item.id || !item.id.videoId) {
            return res.status(404).json({ error: 'No trailer found' });
        }

        return res.status(200).json({ videoId: item.id.videoId });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
