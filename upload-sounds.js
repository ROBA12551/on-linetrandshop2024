// upload-sounds.js
require('dotenv').config();
const AWS = require('ibm-cos-sdk');
const fs = require('fs');
const path = require('path');

// IBM Cloud Object Storageの設定
const cos = new AWS.S3({
  endpoint: 'https://s3.jp-tok.cloud-object-storage.appdomain.cloud',  // IBM Cloudのエンドポイント
  apiKeyId: process.env.IBM_API_KEY,  // 環境変数からAPIキーを取得
  ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',  // 認証エンドポイント
  serviceInstanceId: process.env.IBM_SERVICE_INSTANCE_ID,  // サービスインスタンスIDを環境変数から取得
});

// バケット名
const bucketName = 'your-bucket-name';  // ここでバケット名を指定

// 音声ファイルをアップロードする関数
async function uploadSoundFile(filePath) {
  const fileName = path.basename(filePath);
  const fileStream = fs.createReadStream(filePath);
  const params = {
    Bucket: bucketName,
    Key: `sounds/${fileName}`,
    Body: fileStream,
    ContentType: 'audio/mpeg',  // 必要に応じてファイルタイプを設定
  };

  try {
    const uploadResult = await cos.putObject(params).promise();
    console.log('Upload Successful:', uploadResult);
    return uploadResult;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// `assets/sounds` フォルダ内の音声ファイルをアップロード
const soundFilesPath = path.join(__dirname, 'assets', 'sounds'); // `assets/sounds` フォルダのパス

fs.readdirSync(soundFilesPath).forEach((file) => {
  const filePath = path.join(soundFilesPath, file);
  uploadSoundFile(filePath).then(() => {
    console.log(`File uploaded: ${file}`);
  }).catch((error) => {
    console.error(`Failed to upload: ${file}`, error);
  });
});
