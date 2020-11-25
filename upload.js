const dotenv = require('dotenv');
dotenv.config({path: '.env'});

const fs = require('fs');
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const folder = './output';

const files = [
  // ['airports.csv', true, 'text/csv'],
  // ['postcodes.txt', true, 'text/plain']
];

const folders = [
  ['centroids', true, 'application/json'],
  // ['distances', false, 'application/json'],
  // ['isochrones', true, 'application/json']
];

(async () => {

  for (f in files) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: files[f][0],
      Body: fs.readFileSync(`${folder}/${files[f][0]}`),
      ContentType: files[f][2]
    };

    if (files[f][1]) {
      params['ContentEncoding'] = 'gzip';
    }
    
    const data = await s3.upload(params).promise();
    console.log(files[f][0]);
  }

  for (f in folders) {
    const dir = `${folder}/${folders[f][0]}`;
    const folder_files = fs.readdirSync(dir);
    for (ff in folder_files) {
      if (folder_files[ff].indexOf('.text') > -1 || folder_files[ff].indexOf('.json') > -1) {
        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: folders[f][0] + '/' + folder_files[ff],
          Body: fs.readFileSync(`${dir}/${folder_files[ff]}`),
          ContentType: folders[f][2]
        };
    
        if (folders[f][1]) {
          params['ContentEncoding'] = 'gzip';
        }
        
        const data = await s3.upload(params).promise();
        console.log(folders[f][0], folder_files[ff]);
      }
    }
  }

})();

