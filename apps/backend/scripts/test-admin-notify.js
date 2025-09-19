import dotenv from "dotenv";
dotenv.config();
import { sendAdminApprovalRequest } from "../services/emailService.js";

(async () => {
  await sendAdminApprovalRequest({
    name: "Test User",
    email: "meyoxi9145@anysilo.com",
    phone: "+1234567890",
    id: "testid123",
  });
  process.exit(0);
})();
