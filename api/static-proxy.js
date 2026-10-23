export default async function handler(req, res) {
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : (path || '');
  const cleanPath = pathStr.replace(/^\/+/, '');
  
  const targetUrl = `https://coronary-moonstone-grain.ngrok-free.dev/static/${cleanPath}`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
