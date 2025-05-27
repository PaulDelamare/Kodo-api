// ! IMPORT
import { router } from "../../config/router.config";
import { UserController } from '../Controllers/user.controller';
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.get('/user/get-info', checkApiKey(), checkAuth(), UserController.getInfo);

router.get('/user', checkApiKey(), checkAuth(), UserController.findUserByText);

router.get('/user/:id', checkApiKey(), checkAuth(), UserController.findUserById);

export default router;