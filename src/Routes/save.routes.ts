import { router } from "../../config/router.config";
import { SaveController } from "../Controllers/save.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.post('/save/:videoId', checkApiKey(), checkAuth(), SaveController.saveVideo);

router.get('/save', checkApiKey(), checkAuth(), SaveController.findAllVideoSaved);

router.get('/save-check/:videoId', checkApiKey(), checkAuth(), SaveController.checkSaveVideo);

export default router;
