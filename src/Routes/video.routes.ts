import { router } from "../../config/router.config";
import { VideoController } from "../Controllers/video.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";
const multer = require("multer");
const upload = multer().single("video");

router.post('/video', checkApiKey(), checkAuth(), upload, VideoController.create);

router.get('/video', checkApiKey(), checkAuth(), VideoController.findAllUserVideos);

router.get('/video-all', checkApiKey(), checkAuth(), VideoController.findAllVideos);

router.get('/video/:id', checkApiKey(), checkAuth(), VideoController.findVideoById);

router.get('/video-name', checkApiKey(), checkAuth(), VideoController.findVideoByName);

router.delete('/video/:id', checkApiKey(), checkAuth(), VideoController.deleteVideo);


export default router;
