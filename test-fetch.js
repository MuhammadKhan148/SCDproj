// Import node-fetch if needed
let fetch;
try {
    fetch = require('node-fetch');
} catch (e) {
    console.log('This script requires node-fetch. Please install it with:');
    console.log('npm install node-fetch');
    process.exit(1);
}

async function testAPI() {
    console.log('Testing API with fetch...');
    try {
        const response = await fetch('http://localhost:5000/api/health/liveness', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            timeout: 5000
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        const data = await response.json();
        console.log('Response data:', data);

        console.log('API test successful!');
    } catch (error) {
        console.error('Error testing API:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

testAPI(); 