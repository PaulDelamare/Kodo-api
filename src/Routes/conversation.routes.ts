// ! IMPORT
import { router } from "../../config/router.config";
import { ConversationController } from '../Controllers/conversation.controller';
import { checkApiKey } from "../Utils/checkApiKey/checkApiKey";
import { checkAuth } from "../Utils/validatedLogin/validatedLogin";

router.get('/conversation', checkApiKey(), checkAuth(), ConversationController.findAllUserConversation);

router.get('/conversation-messages/:id', checkApiKey(), checkAuth(), ConversationController.findAllMessageByConversationId);

router.get('/conversation/:userId', checkApiKey(), checkAuth(), ConversationController.findConversationByUserId);

router.get('/check-conversation/:id', checkApiKey(), checkAuth(), ConversationController.checkConversationExists);

router.post('/send-message/:id', checkApiKey(), checkAuth(), ConversationController.sendMessage);


export default router;