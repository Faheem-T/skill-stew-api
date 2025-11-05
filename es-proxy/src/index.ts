import { startConsumer } from "./consumers/eventConsumer.js";
import { setupES } from "./infrastructure/config/esConnection.js";

start();
async function start() {
  await setupES();
  await startConsumer();
}
