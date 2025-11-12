
import { buildApp } from './app';
import { ENV } from "./config/env";
import { addAdminUsers } from './utils/addAdminUser';

async function start() {
  
  try {
    const app = await buildApp();
    
    const res=await addAdminUsers('adminUser.csv', app, 10);
    console.log('Admin Users added Result:', res);
    
    await app.listen({ port: ENV.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

start();

 

