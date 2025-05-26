import { AuthController } from "../Controllers/auth.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import router from "./hello.routes";

router.post('/register', checkApiKey(), AuthController.register);

router.post('/login', checkApiKey(), AuthController.login);

export default router;
