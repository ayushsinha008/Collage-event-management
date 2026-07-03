const http = require('http');
const fs = require('fs');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/v1/organizer/events',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer festflow-staff-organizer'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('organizer_events_output.json', data);
    console.log('Saved output to organizer_events_output.json', res.statusCode);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
