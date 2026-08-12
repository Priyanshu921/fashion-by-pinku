const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config({ path: '../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

async function run() {
  const dummyBuffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex');
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'fashion-by-pinku', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary API Error:', error);
          reject(error);
        } else {
          console.log('Cloudinary Success:', result);
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(dummyBuffer).pipe(uploadStream);
  });
}
run();
