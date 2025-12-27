const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const zip = new JSZip();
const extensionDir = path.join(__dirname, 'extension');
const outputFile = path.join(__dirname, 'weibo-extend.zip');

function addFilesToZip(dir, zipInstance, rootDir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const relativePath = path.relative(rootDir, filePath);

        if (stats.isDirectory()) {
            addFilesToZip(filePath, zipInstance, rootDir);
        } else {
            const content = fs.readFileSync(filePath);
            zipInstance.file(relativePath, content);
        }
    }
}

async function createZip() {
    console.log('Zipping extension folder...');
    if (!fs.existsSync(extensionDir)) {
        console.error('Error: extension directory does not exist.');
        process.exit(1);
    }

    addFilesToZip(extensionDir, zip, extensionDir);

    const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(outputFile, content);
    console.log(`Successfully created ${outputFile}`);
}

createZip().catch(err => {
    console.error('Error creating zip:', err);
    process.exit(1);
});
