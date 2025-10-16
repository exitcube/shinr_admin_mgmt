
import { buildApp } from './app';
import { ENV } from "./config/env";
async function start() {
  

  try {
    const app = await buildApp();
    await app.listen({ port: ENV.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

start();

 

