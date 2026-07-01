import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from './app';
import http from 'http';

async function runTest() {
  console.log('Starting MongoDB Memory Server with Replica Set...');
  
  // We need a replSet for transactions
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  console.log('MongoMemoryReplSet started on', uri);

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const server = http.createServer(app);
  
  await new Promise<void>((resolve) => {
    server.listen(8080, () => {
      console.log('Test Server running on port 8080');
      resolve();
    });
  });

  // Test the health endpoint
  console.log('\n--- Testing GET /api/v1/health ---');
  const healthRes = await fetch('http://localhost:8080/api/v1/health');
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);

  // Test the events endpoint
  console.log('\n--- Testing GET /api/v1/events ---');
  const eventsRes = await fetch('http://localhost:8080/api/v1/events');
  const eventsData = await eventsRes.json();
  console.log('Events Response:', eventsData);

  console.log('\nAll tests executed successfully. Shutting down...');
  
  server.close();
  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
