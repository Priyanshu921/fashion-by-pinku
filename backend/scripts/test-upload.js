const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Got token:', token.substring(0, 20) + '...');

    const dummyImagePath = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyImagePath, Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex'));
    
    const fileBuffer = fs.readFileSync(dummyImagePath);
    const boundary = '----WebKitFormBoundaryDummyBoundary';
    
    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="title"\r\n\r\nTEST API PRODUCT\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="price"\r\n\r\n99.99\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="image"; filename="dummy.png"\r\n`;
    body += `Content-Type: image/png\r\n\r\n`;
    
    const footer = `\r\n--${boundary}--\r\n`;
    
    const finalBody = Buffer.concat([Buffer.from(body), fileBuffer, Buffer.from(footer)]);

    console.log('Sending request...');
    const res = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: finalBody
    });

    const data = await res.json();
    console.log('SUCCESS! HTTP Status:', res.status);
    console.log('Response body:', data);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
testUpload();
