import { router } from "../../config/router.config";
import { CommentController } from "../Controllers/comment.controller";
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.post('/comment', checkApiKey(), checkAuth(), CommentController.publishComment);

router.get('/comment/:id', checkApiKey(), checkAuth(), CommentController.findAllCommentsByVideoId);

export default router;
