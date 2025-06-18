const express = require('express');
const router = express.Router();
const store = require('../data/store');

const validateRequest = (requestData) => {
  const errors = [];
  
  if (!requestData.state) errors.push('state is required');
  if (requestData.state && requestData.state.length > 2) errors.push('state must be 2 characters');
  
  if (!requestData.patient) {
    errors.push('patient is required');
  } else {
    if (!requestData.patient.first_name) errors.push('patient.first_name is required');
    if (!requestData.patient.last_name) errors.push('patient.last_name is required');
    if (!requestData.patient.date_of_birth) errors.push('patient.date_of_birth is required');
  }
  
  if (!requestData.prescription) {
    errors.push('prescription is required');
  } else {
    if (!requestData.prescription.drug_id) errors.push('prescription.drug_id is required');
  }
  
  if (requestData.memo && requestData.memo.length > 4000) {
    errors.push('memo must not exceed 4000 characters');
  }
  
  return errors;
};

router.post('/', (req, res) => {
  const { v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  if (!api_id) {
    return res.status(400).json({ error: 'api_id parameter is required' });
  }
  
  const { request: requestData } = req.body;
  
  if (!requestData) {
    return res.status(400).json({ error: 'Request body must contain a request object' });
  }
  
  const validationErrors = validateRequest(requestData);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validationErrors 
    });
  }
  
  const newRequest = store.createRequest(requestData);
  res.status(201).json(newRequest);
});

router.get('/search', (req, res) => {
  res.status(410).json({ 
    error: 'This endpoint is deprecated. Please use individual request endpoints.' 
  });
});

router.post('/search', (req, res) => {
  const { v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  const { token_ids } = req.body;
  
  if (!token_ids || !Array.isArray(token_ids)) {
    return res.status(400).json({ error: 'token_ids array is required' });
  }
  
  const requests = store.searchRequests(token_ids);
  res.json({ requests });
});

router.post('/tokens', (req, res) => {
  if (req.auth.type !== 'basic') {
    return res.status(401).json({ error: 'Basic authentication required' });
  }
  
  const { v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  const { request_ids } = req.body;
  
  if (!request_ids || !Array.isArray(request_ids)) {
    return res.status(400).json({ error: 'request_ids array is required' });
  }
  
  const tokens = [];
  for (const requestId of request_ids) {
    const token = store.createToken(requestId);
    if (token) {
      tokens.push(token);
    }
  }
  
  if (tokens.length === 0) {
    return res.status(404).json({ error: 'No valid request IDs found' });
  }
  
  res.status(201).json({ tokens });
});

router.delete('/tokens/:token_id', (req, res) => {
  if (req.auth.type !== 'basic') {
    return res.status(401).json({ error: 'Basic authentication required' });
  }
  
  const { token_id } = req.params;
  const { v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  const deleted = store.deleteToken(token_id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  res.status(204).send();
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { token_id, v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  if (!token_id) {
    return res.status(400).json({ error: 'token_id parameter is required' });
  }
  
  const request = store.getRequest(id);
  
  if (!request || request.deleted) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  res.json(request);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { token_id, v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  if (!token_id) {
    return res.status(400).json({ error: 'token_id parameter is required' });
  }
  
  const { request: updateData } = req.body;
  
  if (!updateData || !updateData.memo) {
    return res.status(400).json({ error: 'Request body must contain request.memo' });
  }
  
  if (updateData.memo.length > 4000) {
    return res.status(400).json({ error: 'memo must not exceed 4000 characters' });
  }
  
  const request = store.getRequest(id);
  
  if (!request || request.deleted) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  store.updateRequest(id, { memo: updateData.memo });
  res.status(204).send();
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { token_id, v, api_id } = req.query;
  
  if (!v || v !== '1') {
    return res.status(400).json({ error: 'API version v=1 is required' });
  }
  
  if (!token_id) {
    return res.status(400).json({ error: 'token_id parameter is required' });
  }
  
  const { remote_user } = req.body;
  
  if (!remote_user) {
    return res.status(400).json({ error: 'remote_user is required' });
  }
  
  const deleted = store.deleteRequest(id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  res.status(204).send();
});

module.exports = router;