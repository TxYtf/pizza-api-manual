#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';

function usage() {
  console.error('Usage: npm run test-pizza -- --id=ID  OR npm run test-pizza ID');
  process.exit(1);
}

const args = process.argv.slice(2);
let id;
if (args.length === 0) id = process.env.npm_config_id;
else {
  const idArg = args.find(a => a.startsWith('--id='));
  if (idArg) id = idArg.split('=')[1];
  else id = args[0];
}
if (!id) usage();

const payload = JSON.stringify({ httpMethod: 'GET', resource: `/pizza/${id}` });
const cmdArgs = ['lambda', 'invoke', '--function-name', 'pizza-api-manual-handler', '--payload', payload, 'response.json'];

try {
  const res = spawnSync('aws', cmdArgs, { stdio: 'inherit' });
  if (res.error) throw res.error;
  const out = readFileSync('response.json', 'utf8');
  console.log(out);
} catch (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
}
