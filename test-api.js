const http = require('http');

// Make a request to the API
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health/liveness',
    method: 'GET',
    timeout: 5000
};

console.log('Making request to http://localhost:5000/api/health/liveness');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('RESPONSE BODY:', data);
        console.log('Request completed successfully');
    });
});

req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
});

req.on('timeout', () => {
    console.error('Request timed out');
    req.abort();
});

// Send the request
req.end(); 