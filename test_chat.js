const fetch = require('node-fetch');

async function testChat() {
    const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Hello',
            history: []
        })
    });
    const data = await response.json();
    console.log(data);
}

testChat();
