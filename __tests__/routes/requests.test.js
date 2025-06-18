const request = require('supertest');
const app = require('../../src/app');

describe('Requests API', () => {
  let createdRequestId;
  let createdTokenId;

  afterAll(() => {
    // Clean up any open handles
  });

  describe('POST /requests', () => {
    it('should create a new PA request with valid data', async () => {
      const newRequest = {
        request: {
          state: 'CA',
          urgent: false,
          patient: {
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '01/15/1980'
          },
          prescription: {
            drug_id: 'drug123'
          }
        }
      };

      const response = await request(app)
        .post('/requests?v=1&api_id=test_api')
        .set('Authorization', 'Bearer test_api+test_token')
        .send(newRequest);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.state).toBe('CA');
      expect(response.body.patient.first_name).toBe('John');
      expect(response.body.patient.last_name).toBe('Doe');
      expect(response.body.prescription.drug_id).toBe('drug123');
      
      createdRequestId = response.body.id;
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidRequest = {
        request: {
          patient: {
            first_name: 'John'
          }
        }
      };

      const response = await request(app)
        .post('/requests?v=1&api_id=test_api')
        .set('Authorization', 'Bearer test_api+test_token')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if authorization is missing', async () => {
      const newRequest = {
        request: {
          state: 'CA',
          patient: {
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '01/15/1980'
          },
          prescription: {
            drug_id: 'drug123'
          }
        }
      };

      const response = await request(app)
        .post('/requests?v=1&api_id=test_api')
        .send(newRequest);

      expect(response.status).toBe(401);
    });

    it('should handle optional fields', async () => {
      const newRequest = {
        request: {
          state: 'NY',
          urgent: true,
          form_id: 'form456',
          memo: 'Urgent request for patient',
          patient: {
            first_name: 'Jane',
            middle_name: 'Marie',
            last_name: 'Smith',
            date_of_birth: '05/20/1975'
          },
          prescription: {
            drug_id: 'drug789'
          }
        }
      };

      const response = await request(app)
        .post('/requests?v=1&api_id=test_api')
        .set('Authorization', 'Bearer test_api+test_token')
        .send(newRequest);

      expect(response.status).toBe(201);
      expect(response.body.urgent).toBe(true);
      expect(response.body.form_id).toBe('form456');
      expect(response.body.memo).toBe('Urgent request for patient');
      expect(response.body.patient.middle_name).toBe('Marie');
    });
  });

  describe('GET /requests/:id', () => {
    it('should retrieve an existing request', async () => {
      const response = await request(app)
        .get(`/requests/${createdRequestId}?v=1&api_id=test_api&token_id=test_token`)
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdRequestId);
      expect(response.body.state).toBe('CA');
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/requests/non-existent-id?v=1&api_id=test_api&token_id=test_token')
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(404);
    });

    it('should require token_id parameter', async () => {
      const response = await request(app)
        .get(`/requests/${createdRequestId}?v=1&api_id=test_api`)
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('token_id parameter is required');
    });
  });

  describe('PUT /requests/:id', () => {
    it('should update memo on existing request', async () => {
      const updateData = {
        request: {
          memo: 'Updated memo text'
        }
      };

      const response = await request(app)
        .put(`/requests/${createdRequestId}?v=1&api_id=test_api&token_id=test_token`)
        .set('Authorization', 'Bearer test_api+test_token')
        .send(updateData);

      expect(response.status).toBe(204);
    });

    it('should validate memo length', async () => {
      const updateData = {
        request: {
          memo: 'a'.repeat(4001)
        }
      };

      const response = await request(app)
        .put(`/requests/${createdRequestId}?v=1&api_id=test_api&token_id=test_token`)
        .set('Authorization', 'Bearer test_api+test_token')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('memo must not exceed 4000 characters');
    });
  });

  describe('DELETE /requests/:id', () => {
    it('should soft-delete an existing request', async () => {
      const deleteData = {
        remote_user: {
          display_name: 'Test User',
          phone_number: '555-1234',
          fax_number: '555-5678'
        }
      };

      const response = await request(app)
        .delete(`/requests/${createdRequestId}?v=1&api_id=test_api&token_id=test_token`)
        .set('Authorization', 'Bearer test_api+test_token')
        .send(deleteData);

      expect(response.status).toBe(204);
    });

    it('should require remote_user', async () => {
      const response = await request(app)
        .delete(`/requests/${createdRequestId}?v=1&api_id=test_api&token_id=test_token`)
        .set('Authorization', 'Bearer test_api+test_token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('remote_user is required');
    });
  });

  describe('POST /requests/search', () => {
    it('should search requests by token IDs', async () => {
      const searchData = {
        token_ids: ['token1', 'token2']
      };

      const response = await request(app)
        .post('/requests/search?v=1&api_id=test_api')
        .set('Authorization', 'Bearer test_api+test_token')
        .send(searchData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requests');
      expect(Array.isArray(response.body.requests)).toBe(true);
    });
  });

  describe('POST /requests/tokens', () => {
    it('should create tokens with basic auth', async () => {
      const tokenData = {
        request_ids: [createdRequestId]
      };

      const response = await request(app)
        .post('/requests/tokens?v=1&api_id=test_api')
        .set('Authorization', 'Basic ' + Buffer.from('user:pass').toString('base64'))
        .send(tokenData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tokens');
      expect(Array.isArray(response.body.tokens)).toBe(true);
      
      if (response.body.tokens.length > 0) {
        createdTokenId = response.body.tokens[0].id;
      }
    });

    it('should reject bearer auth for token creation', async () => {
      const tokenData = {
        request_ids: [createdRequestId]
      };

      const response = await request(app)
        .post('/requests/tokens?v=1&api_id=test_api')
        .set('Authorization', 'Bearer test_api+test_token')
        .send(tokenData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Basic authentication required');
    });
  });

  describe('DELETE /requests/tokens/:token_id', () => {
    it('should delete token with basic auth', async () => {
      const response = await request(app)
        .delete(`/requests/tokens/${createdTokenId}?v=1&api_id=test_api`)
        .set('Authorization', 'Basic ' + Buffer.from('user:pass').toString('base64'));

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent token', async () => {
      const response = await request(app)
        .delete('/requests/tokens/non-existent?v=1&api_id=test_api')
        .set('Authorization', 'Basic ' + Buffer.from('user:pass').toString('base64'));

      expect(response.status).toBe(404);
    });
  });
});