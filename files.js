const fs = require('fs');
const path = require('path');

const unnecessaryFiles = ['_pywrap_tensorflow_internal.pyd'];
const targetDir = path.join(__dirname, 'dist');

unnecessaryFiles.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${filePath}`);
  }
});
