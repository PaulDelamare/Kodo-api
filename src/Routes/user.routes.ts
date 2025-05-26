// ! IMPORT
import { router } from "../../config/router.config";
import { UserController } from '../Controllers/user.controller';
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.get('/user/get-info', checkApiKey(), checkAuth(), UserController.getInfo);

export default router;