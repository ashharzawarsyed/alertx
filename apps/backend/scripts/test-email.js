import dotenv from "dotenv";
dotenv.config();
import { sendAdminRegistrationConfirmation } from "../services/emailService.js";

(async () => {
  await sendAdminRegistrationConfirmation({
    name: "Test User",
    email: "meyoxi9145@anysilo.com",
  });
  process.exit(0);
})();
