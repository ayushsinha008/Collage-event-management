const http = require('http');
const fs = require('fs');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/v1/users/me/tickets',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer festflow-student-test'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('tickets_output.json', data);
    console.log('Saved output to tickets_output.json');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
