// ! IMPORT
import { router } from "../../config/router.config";
import { FollowerController } from '../Controllers/follower.controller';
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.post('/follow/:userId', checkApiKey(), checkAuth(), FollowerController.followUser);

router.get('/follow/:userId', checkApiKey(), checkAuth(), FollowerController.checkFollow);

export default router;