import { router } from "../../config/router.config";
import { ViewController } from "../Controllers/view.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.post('/view/:videoId', checkApiKey(), checkAuth(), ViewController.addVideoView);

router.get('/view/:videoId', checkApiKey(), checkAuth(), ViewController.findAllViewsByVideoId);

export default router;
