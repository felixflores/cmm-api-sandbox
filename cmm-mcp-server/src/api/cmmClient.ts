import axios, { AxiosInstance } from 'axios';

export interface PatientInfo {
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

export interface PrescriptionInfo {
  drug_id: string;
  drug_name?: string;
  ndc_code?: string;
  quantity?: number;
  days_supply?: number;
}

export interface PriorAuthRequest {
  state: string;
  patient: PatientInfo;
  prescription: PrescriptionInfo;
  memo?: string;
}

export interface PaRequestResponse {
  id: string;
  status: string;
  workflow_status: string;
  created_at: string;
  updated_at: string;
  patient: PatientInfo;
  prescription: PrescriptionInfo;
  state: string;
  memo?: string;
}

export interface TokenResponse {
  id: string;
  request_id: string;
  href: string;
  html_url: string;
  pdf_url: string;
  created_at: string;
}

export class CmmApiClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(baseURL: string = 'http://localhost:3000', apiKey: string = 'demo-api-key') {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include API key
    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        api_id: this.apiKey,
        v: '1'
      };
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('CMM API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async createPriorAuthRequest(request: PriorAuthRequest): Promise<PaRequestResponse> {
    const response = await this.client.post('/requests', { request });
    return response as any;
  }

  async getRequest(id: string, tokenId: string): Promise<PaRequestResponse> {
    const response = await this.client.get(`/requests/${id}`, {
      params: { token_id: tokenId }
    });
    return response as any;
  }

  async updateRequestMemo(id: string, memo: string, tokenId: string): Promise<void> {
    await this.client.put(`/requests/${id}`, 
      { request: { memo } }, 
      { params: { token_id: tokenId } }
    );
  }

  async deleteRequest(id: string, tokenId: string, remoteUser: string): Promise<void> {
    await this.client.delete(`/requests/${id}`, {
      params: { token_id: tokenId },
      data: { remote_user: remoteUser }
    });
  }

  async searchRequests(tokenIds: string[]): Promise<{ requests: PaRequestResponse[] }> {
    const response = await this.client.post('/requests/search', { token_ids: tokenIds });
    return response as any;
  }

  async createTokens(requestIds: string[]): Promise<{ tokens: TokenResponse[] }> {
    // Note: This requires basic auth in the real API
    const response = await this.client.post('/requests/tokens', { request_ids: requestIds });
    return response as any;
  }

  async deleteToken(tokenId: string): Promise<void> {
    // Note: This requires basic auth in the real API
    await this.client.delete(`/requests/tokens/${tokenId}`);
  }

  async getRequestPage(id: string, tokenId: string): Promise<any> {
    const response = await this.client.get(`/request-pages/${id}`, {
      params: { token_id: tokenId }
    });
    return response;
  }

  // Helper method to validate state codes
  validateState(state: string): boolean {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    return validStates.includes(state.toUpperCase());
  }
}