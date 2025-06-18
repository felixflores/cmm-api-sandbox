const app = require('./app');
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`\n🚀 CoverMyMeds API Sandbox running on http://localhost:${port}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST   /requests');
  console.log('  GET    /requests/:id');
  console.log('  PUT    /requests/:id');
  console.log('  DELETE /requests/:id');
  console.log('  POST   /requests/search');
  console.log('  POST   /requests/tokens');
  console.log('  DELETE /requests/tokens/:token_id');
  console.log('  GET    /request-pages/:id');
  console.log('\nRemember to include:');
  console.log('  - v=1 query parameter');
  console.log('  - api_id query parameter');
  console.log('  - Authorization header (Bearer or Basic)');
  console.log('  - token_id parameter where required\n');
});

module.exports = server;