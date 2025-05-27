import { RequestHandler } from "express"
import { handleError } from "../Utils/errorHandler/errorHandler";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { ConversationServices } from "../Services/conversation.services";
import vine from "@vinejs/vine";
import { Infer } from "@vinejs/vine/build/src/types";
import { validateData } from "../Utils/validateData/validateData";
import { sendToRoom } from "../socker.server";

const findAllUserConversation: RequestHandler = async (req, res) => {

    const user = req.user!;
    try {

        const conversations = await ConversationServices.findAllUserConversationService(user.id);

        sendSuccess(res, 200, "Liste des conversations de l'utilisateur", conversations);


    } catch (error) {
        handleError(error, req, res, 'ConversationController.findAllUserConversation');
    }
}

const findConversationByUserId: RequestHandler = async (req, res) => {

    const user = req.user!;
    const schemaData = vine.object({
        userId: vine.string().uuid(),
    });

    try {

        const conversation = await ConversationServices.findConversationByUserIdService(await validateData(schemaData, req.params as Infer<typeof schemaData>), user.id);

        sendSuccess(res, 200, "Conversation trouvée", conversation);

    } catch (error) {
        handleError(error, req, res, 'ConversationController.findConversationByUserId');
    }
}

const findAllMessageByConversationId: RequestHandler = async (req, res) => {

    const user = req.user!;
    const schemaData = vine.object({
        id: vine.string().uuid()
    });

    try {


        const messages = await ConversationServices.findAllMessageByConversationIdService(
            await validateData(
                schemaData,
                req.params as Infer<typeof schemaData>
            ),
            user.id
        );

        sendSuccess(res, 200, 'Messages trouvés', messages);
    } catch (error) {
        handleError(error, req, res, 'ConversationController.findAllMessageByConversationId');
    }
}

const sendMessage: RequestHandler = async (req, res) => {

    const user = req.user!;

    const schema = vine.object({
        id: vine.string().uuid(),
        content: vine.string().minLength(1).maxLength(500)
    });

    try {
        const raw = {
            id: req.params.id,
            content: req.body.content
        };

        const validated = await validateData(schema, raw as unknown as Infer<typeof schema>);

        const userId = user.id;

        const message = await ConversationServices.sendMessageService(validated, userId);

        sendToRoom(req.params.id, JSON.stringify(message));

        sendSuccess(res, 201, 'Message envoyé');
    } catch (error) {
        handleError(error, req, res, 'ConversationController.sendMessage');
    }
};

const checkConversationExists: RequestHandler = async (req, res) => {
    const user = req.user!;
    const schemaData = vine.object({
        id: vine.string().uuid(),
    });

    try {
        const { id } = await validateData(schemaData, req.params as Infer<typeof schemaData>);

        const conversation = await ConversationServices.checkConversationExistsService(id, user.id);

        sendSuccess(res, 200, 'Conversation exists', conversation);

    } catch (error) {

        handleError(error, req, res, 'ConversationController.checkConversationExists');
    }
}

const defineAllActiveMessageView: RequestHandler = async (req, res) => {
    const schemaData = vine.object({
        conversationId: vine.string().uuid(),
    });
    const user = req.user!;
    try {
        const { conversationId } = await validateData(schemaData, req.params as Infer<typeof schemaData>);

        const messages = await ConversationServices.defineAllActiveMessageViewService(conversationId, user.id);

        sendSuccess(res, 200, 'Messages view status updated', messages);
    } catch (error) {
        handleError(error, req, res, 'ConversationController.defineAllActiveMessageView');
    }
}

export const ConversationController = {
    findAllUserConversation,
    findConversationByUserId,
    findAllMessageByConversationId,
    sendMessage,
    checkConversationExists,
    defineAllActiveMessageView
}