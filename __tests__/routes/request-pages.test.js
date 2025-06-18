const request = require('supertest');
const app = require('../../src/app');

describe('Request Pages API', () => {
  describe('GET /request-pages/:id', () => {
    it('should retrieve request page with forms and actions', async () => {
      const response = await request(app)
        .get('/request-pages/test-page-id?v=1&api_id=test_api&token_id=test_token')
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('forms');
      expect(response.body).toHaveProperty('actions');
      expect(Array.isArray(response.body.forms)).toBe(true);
      expect(Array.isArray(response.body.actions)).toBe(true);
      
      // Verify form structure
      expect(response.body.forms[0]).toHaveProperty('identifier');
      expect(response.body.forms[0]).toHaveProperty('question_sets');
      expect(Array.isArray(response.body.forms[0].question_sets)).toBe(true);
      
      // Verify questions
      const questions = response.body.forms[0].question_sets[0].questions;
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      
      questions.forEach(question => {
        expect(question).toHaveProperty('question_id');
        expect(question).toHaveProperty('question_type');
        expect(question).toHaveProperty('question_text');
      });
      
      // Verify actions
      response.body.actions.forEach(action => {
        expect(action).toHaveProperty('ref');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('href');
        expect(action).toHaveProperty('method');
        expect(action).toHaveProperty('display');
      });
    });

    it('should return 401 if authorization is missing', async () => {
      const response = await request(app)
        .get('/request-pages/test-page-id?v=1&api_id=test_api&token_id=test_token');

      expect(response.status).toBe(401);
    });

    it('should require v parameter', async () => {
      const response = await request(app)
        .get('/request-pages/test-page-id?api_id=test_api&token_id=test_token')
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('API version v=1 is required');
    });

    it('should require token_id parameter', async () => {
      const response = await request(app)
        .get('/request-pages/test-page-id?v=1&api_id=test_api')
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('token_id parameter is required');
    });

    it('should handle different question types', async () => {
      const response = await request(app)
        .get('/request-pages/test-page-id?v=1&api_id=test_api&token_id=test_token')
        .set('Authorization', 'Bearer test_api+test_token');

      expect(response.status).toBe(200);
      
      const questions = response.body.forms[0].question_sets[0].questions;
      const questionTypes = questions.map(q => q.question_type);
      
      expect(questionTypes).toContain('FREE_TEXT');
      expect(questionTypes).toContain('DATE');
      expect(questionTypes).toContain('CHOICE');
      
      // Verify CHOICE question has choices
      const choiceQuestion = questions.find(q => q.question_type === 'CHOICE');
      expect(choiceQuestion).toHaveProperty('choices');
      expect(Array.isArray(choiceQuestion.choices)).toBe(true);
      expect(choiceQuestion.choices.length).toBeGreaterThan(0);
      choiceQuestion.choices.forEach(choice => {
        expect(choice).toHaveProperty('code');
        expect(choice).toHaveProperty('display');
      });
    });
  });
});