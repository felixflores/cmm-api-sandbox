#!/usr/bin/env node

require('dotenv').config();
const readline = require('readline');
const axios = require('axios');
const GitHubService = require('./utils/github');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE = 'http://localhost:3000';
let apiId = 'test_api';
let tokenId = 'test_token';
let authType = 'bearer';
let authToken = `${apiId}+${tokenId}`;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function printMenu() {
  console.log(`\n${colors.bright}=== CoverMyMeds API Sandbox CLI ===${colors.reset}`);
  console.log(`${colors.dim}Current auth: ${authType} (${authType === 'bearer' ? authToken : 'user:pass'})${colors.reset}\n`);
  console.log('1. Create PA Request');
  console.log('2. Get PA Request');
  console.log('3. Update PA Request Memo');
  console.log('4. Delete PA Request');
  console.log('5. Search PA Requests');
  console.log('6. Create Tokens');
  console.log('7. Delete Token');
  console.log('8. Get Request Page');
  console.log('9. Toggle Auth Type (Bearer/Basic)');
  console.log('10. List GitHub Issues');
  console.log('11. Get GitHub Issue Details');
  console.log('0. Exit\n');
}

function getAuthHeader() {
  if (authType === 'bearer') {
    return `Bearer ${authToken}`;
  } else {
    return 'Basic ' + Buffer.from('user:pass').toString('base64');
  }
}

async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`\n${colors.green}Success!${colors.reset}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log(`\n${colors.red}Error:${colors.reset}`, error.response?.data || error.message);
    return null;
  }
}

async function createRequest() {
  console.log(`\n${colors.cyan}Creating new PA Request...${colors.reset}`);
  const requestData = {
    request: {
      state: 'CA',
      urgent: false,
      memo: 'Test request from CLI',
      patient: {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '01/15/1980'
      },
      prescription: {
        drug_id: 'drug_' + Math.floor(Math.random() * 1000)
      }
    }
  };

  const result = await makeRequest('POST', `/requests?v=1&api_id=${apiId}`, requestData);
  if (result) {
    console.log(`\n${colors.yellow}Request ID: ${result.id}${colors.reset}`);
    return result.id;
  }
}

async function getRequest() {
  return new Promise((resolve) => {
    rl.question('Enter Request ID: ', async (id) => {
      await makeRequest('GET', `/requests/${id}?v=1&api_id=${apiId}&token_id=${tokenId}`);
      resolve();
    });
  });
}

async function updateRequest() {
  return new Promise((resolve) => {
    rl.question('Enter Request ID: ', (id) => {
      rl.question('Enter new memo: ', async (memo) => {
        const data = { request: { memo } };
        await makeRequest('PUT', `/requests/${id}?v=1&api_id=${apiId}&token_id=${tokenId}`, data);
        resolve();
      });
    });
  });
}

async function deleteRequest() {
  return new Promise((resolve) => {
    rl.question('Enter Request ID: ', async (id) => {
      const data = {
        remote_user: {
          display_name: 'CLI User',
          phone_number: '555-0001',
          fax_number: '555-0002'
        }
      };
      await makeRequest('DELETE', `/requests/${id}?v=1&api_id=${apiId}&token_id=${tokenId}`, data);
      resolve();
    });
  });
}

async function searchRequests() {
  console.log(`\n${colors.cyan}Searching requests...${colors.reset}`);
  const data = { token_ids: [tokenId, 'token1', 'token2'] };
  await makeRequest('POST', `/requests/search?v=1&api_id=${apiId}`, data);
}

async function createTokens() {
  return new Promise((resolve) => {
    rl.question('Enter Request ID (comma-separated for multiple): ', async (ids) => {
      const requestIds = ids.split(',').map(id => id.trim());
      const data = { request_ids: requestIds };
      
      if (authType !== 'basic') {
        console.log(`${colors.yellow}Note: Switching to Basic auth for token creation${colors.reset}`);
      }
      
      const tempAuth = authType;
      authType = 'basic';
      const result = await makeRequest('POST', `/requests/tokens?v=1&api_id=${apiId}`, data);
      authType = tempAuth;
      
      if (result && result.tokens) {
        console.log(`\n${colors.yellow}Created tokens:${colors.reset}`);
        result.tokens.forEach(token => {
          console.log(`  Token ID: ${token.id}`);
          console.log(`  View URL: ${token.html_url}`);
        });
      }
      resolve();
    });
  });
}

async function deleteToken() {
  return new Promise((resolve) => {
    rl.question('Enter Token ID: ', async (id) => {
      if (authType !== 'basic') {
        console.log(`${colors.yellow}Note: Switching to Basic auth for token deletion${colors.reset}`);
      }
      
      const tempAuth = authType;
      authType = 'basic';
      await makeRequest('DELETE', `/requests/tokens/${id}?v=1&api_id=${apiId}`);
      authType = tempAuth;
      resolve();
    });
  });
}

async function getRequestPage() {
  return new Promise((resolve) => {
    rl.question('Enter Page ID: ', async (id) => {
      await makeRequest('GET', `/request-pages/${id}?v=1&api_id=${apiId}&token_id=${tokenId}`);
      resolve();
    });
  });
}

function toggleAuth() {
  authType = authType === 'bearer' ? 'basic' : 'bearer';
  console.log(`\n${colors.green}Auth type switched to: ${authType}${colors.reset}`);
}

async function listGitHubIssues() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  
  if (!owner || !repo) {
    console.log(`${colors.red}Error: GITHUB_OWNER and GITHUB_REPO must be set in .env file${colors.reset}`);
    return;
  }

  if (!process.env.GITHUB_TOKEN) {
    console.log(`${colors.red}Error: GITHUB_TOKEN must be set in .env file${colors.reset}`);
    return;
  }

  try {
    console.log(`\n${colors.cyan}Fetching GitHub issues from ${owner}/${repo}...${colors.reset}`);
    const github = new GitHubService();
    const issues = await github.getRepositoryIssues(owner, repo, { per_page: 10 });
    
    if (issues.length === 0) {
      console.log(`${colors.yellow}No issues found${colors.reset}`);
      return;
    }

    console.log(`\n${colors.bright}Found ${issues.length} issues:${colors.reset}\n`);
    
    issues.forEach((issue, index) => {
      const statusColor = issue.state === 'open' ? colors.green : colors.red;
      const labels = issue.labels.map(label => `[${label.name}]`).join(' ');
      
      console.log(`${colors.bright}${index + 1}. #${issue.number} ${issue.title}${colors.reset}`);
      console.log(`   Status: ${statusColor}${issue.state}${colors.reset}`);
      if (labels) console.log(`   Labels: ${colors.blue}${labels}${colors.reset}`);
      console.log(`   Created: ${colors.dim}${new Date(issue.created_at).toLocaleDateString()}${colors.reset}`);
      console.log(`   URL: ${colors.cyan}${issue.url}${colors.reset}\n`);
    });
    
  } catch (error) {
    console.log(`${colors.red}Error fetching GitHub issues: ${error.message}${colors.reset}`);
  }
}

async function getGitHubIssueDetails() {
  return new Promise((resolve) => {
    rl.question('Enter GitHub issue number: ', async (issueNumber) => {
      const owner = process.env.GITHUB_OWNER;
      const repo = process.env.GITHUB_REPO;
      
      if (!owner || !repo) {
        console.log(`${colors.red}Error: GITHUB_OWNER and GITHUB_REPO must be set in .env file${colors.reset}`);
        resolve();
        return;
      }

      if (!process.env.GITHUB_TOKEN) {
        console.log(`${colors.red}Error: GITHUB_TOKEN must be set in .env file${colors.reset}`);
        resolve();
        return;
      }

      try {
        console.log(`\n${colors.cyan}Fetching issue #${issueNumber}...${colors.reset}`);
        const github = new GitHubService();
        const issue = await github.getIssue(owner, repo, parseInt(issueNumber));
        
        const statusColor = issue.state === 'open' ? colors.green : colors.red;
        const labels = issue.labels.map(label => `[${label.name}]`).join(' ');
        const assignees = issue.assignees.map(a => a.login).join(', ');
        
        console.log(`\n${colors.bright}Issue #${issue.number}: ${issue.title}${colors.reset}`);
        console.log(`Status: ${statusColor}${issue.state}${colors.reset}`);
        if (labels) console.log(`Labels: ${colors.blue}${labels}${colors.reset}`);
        if (assignees) console.log(`Assignees: ${colors.magenta}${assignees}${colors.reset}`);
        console.log(`Created: ${colors.dim}${new Date(issue.created_at).toLocaleDateString()}${colors.reset}`);
        console.log(`Updated: ${colors.dim}${new Date(issue.updated_at).toLocaleDateString()}${colors.reset}`);
        console.log(`URL: ${colors.cyan}${issue.url}${colors.reset}\n`);
        
        if (issue.body) {
          console.log(`${colors.bright}Description:${colors.reset}`);
          console.log(issue.body);
        }
        
      } catch (error) {
        console.log(`${colors.red}Error fetching GitHub issue: ${error.message}${colors.reset}`);
      }
      
      resolve();
    });
  });
}

async function handleChoice(choice) {
  switch (choice) {
    case '1':
      await createRequest();
      break;
    case '2':
      await getRequest();
      break;
    case '3':
      await updateRequest();
      break;
    case '4':
      await deleteRequest();
      break;
    case '5':
      await searchRequests();
      break;
    case '6':
      await createTokens();
      break;
    case '7':
      await deleteToken();
      break;
    case '8':
      await getRequestPage();
      break;
    case '9':
      toggleAuth();
      break;
    case '10':
      await listGitHubIssues();
      break;
    case '11':
      await getGitHubIssueDetails();
      break;
    case '0':
      console.log('\nGoodbye!');
      rl.close();
      process.exit(0);
    default:
      console.log(`${colors.red}Invalid choice!${colors.reset}`);
  }
}

async function main() {
  console.log(`${colors.bright}Welcome to CoverMyMeds API Sandbox CLI${colors.reset}`);
  console.log(`Make sure the server is running on ${API_BASE}\n`);

  const loop = async () => {
    printMenu();
    rl.question('Enter your choice: ', async (choice) => {
      await handleChoice(choice);
      setTimeout(loop, 1000);
    });
  };

  loop();
}

main();