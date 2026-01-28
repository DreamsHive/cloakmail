import { startSMTP } from "./smtp";
import { startAPI } from "./api";

console.log("[cloakmail] Starting server...");

startSMTP();
startAPI();
