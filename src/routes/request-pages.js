const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { token_id, v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  if (!token_id) {
    return res.status(400).json({ error: 'token_id parameter is required' });
  }
  
  const requestPage = store.getRequestPage(id);
  res.json(requestPage);
});

module.exports = router;