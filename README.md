# CoverMyMeds API Sandbox

An interactive Node.js sandbox for testing the CoverMyMeds Prior Authorization API (based on 2019 archived specification).

## Features

- Complete implementation of all API endpoints
- Mock data store (no real database required)
- Bearer and Basic authentication support
- Interactive CLI for testing
- Comprehensive test suite using Jest

## Installation

```bash
npm install
```

## Running the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

The server will start on http://localhost:3000

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:once

# Run tests with coverage
npm run test:coverage
```

## Using the Interactive CLI

After starting the server, in a new terminal:

```bash
npm run cli
```

The CLI provides an interactive menu to:
- Create PA requests
- Retrieve, update, and delete requests
- Create and manage access tokens
- View request pages
- Toggle between Bearer and Basic authentication

## API Endpoints

All endpoints require:
- `v=1` query parameter
- `api_id` query parameter
- Authorization header (Bearer or Basic)

### Requests

- `POST /requests` - Create a new PA request
- `GET /requests/:id` - Retrieve a request (requires token_id)
- `PUT /requests/:id` - Update request memo (requires token_id)
- `DELETE /requests/:id` - Soft-delete a request (requires token_id)
- `POST /requests/search` - Search requests by token IDs

### Tokens

- `POST /requests/tokens` - Create access tokens (requires Basic auth)
- `DELETE /requests/tokens/:token_id` - Revoke a token (requires Basic auth)

### Request Pages

- `GET /request-pages/:id` - Get hypermedia workflow page (requires token_id)

## Authentication

### Bearer Token
```
Authorization: Bearer api_id+token_id
```

### Basic Auth
```
Authorization: Basic base64(username:password)
```

## Example Request

```bash
curl -X POST http://localhost:3000/requests?v=1&api_id=test_api \
  -H "Authorization: Bearer test_api+test_token" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "state": "CA",
      "patient": {
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "01/15/1980"
      },
      "prescription": {
        "drug_id": "drug123"
      }
    }
  }'
```

## Data Persistence

This sandbox uses an in-memory data store. All data is lost when the server restarts. This is intentional for testing purposes.