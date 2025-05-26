import { router } from "../../config/router.config";
import { AuthController } from "../Controllers/auth.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";

router.post('/register', checkApiKey(), AuthController.register);

router.post('/login', checkApiKey(), AuthController.login);

export default router;
