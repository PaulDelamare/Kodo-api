import { router } from "../../config/router.config";
import { AuthController } from "../Controllers/auth.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";

router.post('/register', checkApiKey(), AuthController.register);

router.post('/login', checkApiKey(), AuthController.login);

router.post('/reset-password', checkApiKey(), AuthController.generatePasswordResetToken);

// Check if user exists
router.get('/check-request', checkApiKey(), AuthController.checkUserRequest);

// Change password
router.post('/change-password', checkApiKey(), AuthController.changePassword);

export default router;
