import archiver from 'archiver';
import fs from 'fs';

const output = fs.createWriteStream('pizza-api-manual-handler.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Archive created: ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Додаємо файли та папки
archive.file('api.mjs', { name: 'api.mjs' });
archive.file('package.json', { name: 'package.json' });
archive.directory('handlers/', 'handlers/');
archive.directory('stores/', 'stores/');
archive.directory('data/', 'data/');
archive.directory('node_modules/', 'node_modules/');

archive.finalize();
