import { Comment, User, Video } from "@prisma/client";
import { bdd } from "../../config/prismaClient.config";
import { throwError } from "../Utils/errorHandler/errorHandler";

const publishCommentService = async (validatedData: Pick<Comment, 'comment' | 'video_id'>, userId: User['id']) => {
    const { comment, video_id } = validatedData;

    return bdd.comment.create({
        data: {
            comment,
            video: {
                connect: { id: video_id }
            },
            user: {
                connect: { id: userId }
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    firstname: true,
                    email: true
                }
            }
        }
    });
}

/**
 * Récupère les commentaires paginés pour une vidéo.
 *
 * @param videoId  L'ID de la vidéo
 * @param page     Numéro de page (1-based)
 * @param pageSize Nombre d'éléments par page
 */
export const findAllCommentsByVideoIdService = async (
    videoId: string,
    page: number,
    pageSize: number = 20
) => {
    const skip = (page - 1) * pageSize;

    const comments = await bdd.comment.findMany({
        where: { video_id: videoId },
        include: {
            user: {
                select: { id: true, name: true, email: true, firstname: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
    });

    if (!comments) {
        return throwError(404, 'Commentaires non trouvés');
    }

    return comments;
};

export const CommentServices = {
    publishCommentService,
    findAllCommentsByVideoIdService
}