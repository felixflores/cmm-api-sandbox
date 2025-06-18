const { v4: uuidv4 } = require('uuid');

class DataStore {
  constructor() {
    this.requests = new Map();
    this.tokens = new Map();
    this.requestPages = new Map();
  }

  createRequest(requestData) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const request = {
      id,
      ...requestData,
      created_at: timestamp,
      updated_at: timestamp,
      status: 'PENDING',
      workflow_status: 'NEW'
    };
    
    this.requests.set(id, request);
    return request;
  }

  getRequest(id) {
    return this.requests.get(id);
  }

  updateRequest(id, updates) {
    const request = this.requests.get(id);
    if (!request) return null;
    
    const updatedRequest = {
      ...request,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    this.requests.set(id, updatedRequest);
    return updatedRequest;
  }

  deleteRequest(id) {
    const request = this.requests.get(id);
    if (!request) return false;
    
    request.deleted = true;
    request.deleted_at = new Date().toISOString();
    this.requests.set(id, request);
    return true;
  }

  searchRequests(tokenIds) {
    const results = [];
    for (const [requestId, request] of this.requests) {
      const associatedTokens = Array.from(this.tokens.values())
        .filter(token => token.request_id === requestId);
      
      if (associatedTokens.some(token => tokenIds.includes(token.id))) {
        results.push(request);
      }
    }
    return results;
  }

  createToken(requestId) {
    if (!this.requests.has(requestId)) return null;
    
    const tokenId = uuidv4();
    const token = {
      id: tokenId,
      request_id: requestId,
      href: `https://api.covermymeds.com/requests/tokens/${tokenId}`,
      html_url: `https://covermymeds.com/request/${requestId}/view/${tokenId}`,
      pdf_url: `https://api.covermymeds.com/requests/${requestId}/pdf?token_id=${tokenId}`,
      created_at: new Date().toISOString()
    };
    
    this.tokens.set(tokenId, token);
    return token;
  }

  deleteToken(tokenId) {
    return this.tokens.delete(tokenId);
  }

  getRequestPage(id) {
    const mockPage = {
      id,
      forms: [{
        identifier: 'pa_form_' + id,
        question_sets: [{
          title: 'Patient Information',
          questions: [
            {
              question_id: 'q1',
              question_type: 'FREE_TEXT',
              question_text: 'Patient Name',
              flag: 'REQUIRED'
            },
            {
              question_id: 'q2',
              question_type: 'DATE',
              question_text: 'Date of Birth',
              flag: 'REQUIRED'
            },
            {
              question_id: 'q3',
              question_type: 'CHOICE',
              question_text: 'Insurance Type',
              choices: [
                { code: 'COMMERCIAL', display: 'Commercial Insurance' },
                { code: 'MEDICARE', display: 'Medicare' },
                { code: 'MEDICAID', display: 'Medicaid' }
              ]
            }
          ]
        }]
      }],
      actions: [
        {
          ref: 'submit',
          title: 'Submit PA Request',
          href: `https://api.covermymeds.com/request-pages/${id}/submit`,
          method: 'POST',
          display: 'DEFAULT'
        },
        {
          ref: 'save',
          title: 'Save Draft',
          href: `https://api.covermymeds.com/request-pages/${id}/save`,
          method: 'POST',
          display: 'DEFAULT'
        }
      ]
    };
    
    this.requestPages.set(id, mockPage);
    return mockPage;
  }
}

module.exports = new DataStore();