import { RequestHandler } from "express"
import { handleError } from "../Utils/errorHandler/errorHandler";
import vine from "@vinejs/vine";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { CommentServices } from "../Services/comment.services";
import { validateData } from "../Utils/validateData/validateData";
import { Infer } from "@vinejs/vine/build/src/types";

const publishComment: RequestHandler = async (req, res) => {

    const schemaData = vine.object({
        comment: vine.string().minLength(1).maxLength(500),
        video_id: vine.string().uuid(),
    });

    const user = req.user!;

    try {
        const video = await CommentServices.publishCommentService(await validateData(schemaData, req.body), user.id);

        sendSuccess(res, 201, "Commentaire publié", video);

    } catch (error) {

        handleError(error, req, res, 'CommentController.publishComment');
    }
}

const findAllCommentsByVideoId: RequestHandler = async (req, res) => {
    // Schéma de validation des params + query
    const schemaData = vine.object({
        id: vine.string().uuid(),
        page: vine.number().min(1).optional(),
        pageSize: vine.number().min(1).optional()
    });

    try {
        // Rassemble id (route param) + pagination (query string)
        const data = {
            id: req.params.id,
            page: req.query.page,
            pageSize: req.query.pageSize
        };

        // Validation
        const { id, page = 1, pageSize = 20 } = await validateData(
            schemaData,
            data as unknown as Infer<typeof schemaData>
        );

        // Appel du service avec pagination
        const comments = await CommentServices.findAllCommentsByVideoIdService(
            id,
            page,
            pageSize
        );

        // Réponse
        sendSuccess(res, 200, 'Commentaires trouvés', comments);
    } catch (error) {
        handleError(error, req, res, 'CommentController.findAllCommentsByVideoId');
    }
};

export const CommentController = {
    publishComment,
    findAllCommentsByVideoId
}