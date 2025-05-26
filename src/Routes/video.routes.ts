// ! IMPORT
import { router } from "../../config/router.config";
import { VideoController } from "../Controllers/video.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";
const multer = require("multer");
const upload = multer().single("video")
     ;

router.post('/video', checkApiKey(), checkAuth(), upload, VideoController.create);


export default router
