const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Server Smoke Test...');

const serverProc = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, '..', 'apps', 'web'),
  env: { ...process.env, PORT: '3099', NODE_ENV: 'test' },
  stdio: 'pipe'
});

let serverOutput = '';
serverProc.stdout.on('data', (d) => { serverOutput += d.toString(); });
serverProc.stderr.on('data', (d) => { serverOutput += d.toString(); });

function waitForServer(retries = 20) {
  if (retries <= 0) {
    console.error('Server failed to start in time. Output:\n', serverOutput);
    serverProc.kill();
    process.exit(1);
  }

  http.get('http://localhost:3099/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('  ✓ Received /api/health response:', json);
        assert.strictEqual(json.status, 'healthy');
        console.log('  ✓ Server healthcheck verified successfully!');

        // Query candidates endpoint
        http.get('http://localhost:3099/api/elections/1/candidates', (cRes) => {
          let cData = '';
          cRes.on('data', (chunk) => cData += chunk);
          cRes.on('end', () => {
            const cJson = JSON.parse(cData);
            console.log(`  ✓ Retrieved ${cJson.candidates.length} candidates from database.`);
            assert(cJson.candidates.length > 0, 'Candidates should be present');
            console.log('\n🎉 SERVER SMOKE TEST COMPLETED SUCCESSFULLY!\n');
            serverProc.kill();
            process.exit(0);
          });
        });
      } catch (e) {
        console.error('Failed parsing health response:', e);
        serverProc.kill();
        process.exit(1);
      }
    });
  }).on('error', () => {
    setTimeout(() => waitForServer(retries - 1), 250);
  });
}

setTimeout(waitForServer, 500);
