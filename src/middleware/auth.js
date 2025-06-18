const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const [apiId, tokenId] = token.split('+');
    
    if (!apiId || !tokenId) {
      return res.status(401).json({ error: 'Invalid bearer token format' });
    }
    
    req.auth = { type: 'bearer', apiId, tokenId };
  } else if (authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    if (!username || !password) {
      return res.status(401).json({ error: 'Invalid basic auth format' });
    }
    
    req.auth = { type: 'basic', username, password };
  } else {
    return res.status(401).json({ error: 'Invalid authorization type' });
  }
  
  next();
};

module.exports = { authMiddleware };