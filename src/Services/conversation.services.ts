import { N } from "vitest/dist/chunks/reporters.d.CfRkRKN2";
import { bdd } from "../../config/prismaClient.config";
import { throwError } from "../Utils/errorHandler/errorHandler";

type UserConversation = {
    conversationId: string;
    user: {
        id: string;
        name?: string | null;
        firstname?: string | null;
        email: string;
    } | null;
    lastMessage: {
        id: string;
        content: string;
        createdAt: Date;
        senderId: string;
    } | null;
};

const findAllUserConversationService = async (
    userId: string
): Promise<UserConversation[]> => {
    const conversations = await bdd.conversation.findMany({
        where: {
            members: {
                some: { userId }
            }
        },
        include: {
            members: {
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
            },
            // On ne prend que le dernier message
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    senderId: true,
                    isView: true
                }
            }
        },
        orderBy: {
            // Tri des conversations par date de création (à adapter si vous avez un champ updatedAt ou lastMessageAt)
            createdAt: 'desc'
        }
    });

    // On transforme pour ne renvoyer que l'autre user + lastMessage
    return conversations.map((conv) => {
        // L’autre membre (différent de l’utilisateur courant)
        const otherMember = conv.members.find((m) => m.userId !== userId);
        const lastMsg = conv.messages[0] ?? null;

        return {
            conversationId: conv.id,
            user: otherMember?.user ?? null,
            lastMessage: lastMsg
                ? {
                    id: lastMsg.id,
                    content: lastMsg.content,
                    createdAt: lastMsg.createdAt,
                    senderId: lastMsg.senderId,
                    isView: lastMsg.isView
                }
                : null
        };
    });
};

const findConversationByUserIdService = async (validatedData: { userId: string }, userId: string): Promise<{ id: string }> => {
    let conv = await bdd.conversation.findFirst({
        where: {
            AND: [
                { members: { some: { userId: validatedData.userId } } },
                { members: { some: { userId: userId } } }
            ]
        },
        select: { id: true }
    });

    if (!conv) {
        conv = await bdd.conversation.create({
            data: {
                members: {
                    create: [
                        { userId: validatedData.userId },
                        { userId: userId }
                    ]
                }
            },
            select: { id: true }
        });
    }

    return { id: conv.id };
}
const findAllMessageByConversationIdService = async (
    validatedData: { id: string },
    userId: string
) => {
    // 1️⃣ Vérifier que l'utilisateur est bien membre de la conversation
    const isMember = await bdd.conversation.findFirst({
        where: {
            id: validatedData.id,
            members: { some: { userId } }
        },
        select: { id: true }
    });

    if (!isMember) {
        // 403 Forbidden si l'utilisateur n’est pas dans la conversation
        return throwError(403, "Vous n'êtes pas membre de cette conversation");
    }

    // 2️⃣ Récupérer les messages
    const messages = await bdd.message.findMany({
        where: {
            conversationId: validatedData.id
        },
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    firstname: true,
                    email: true
                }
            }
        }
    });

    return messages;
};

interface SendMessageData {
    id: string;       // conversationId
    content: string;  // texte du message
}

const sendMessageService = async (
    data: SendMessageData,
    userId: string
) => {

    const isMember = await bdd.conversation.findFirst({
        where: {
            id: data.id,
            members: { some: { userId } }
        },
        select: { id: true }
    });
    if (!isMember) {
        return throwError(403, 'Vous ne pouvez pas envoyer de message dans cette conversation');
    }

    const message = await bdd.message.create({
        data: {
            conversationId: data.id,
            senderId: userId,
            content: data.content
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    firstname: true,
                    email: true
                }
            }
        }
    });

    return message;
};


type ConversationWithOtherUser = {
    conversationId: string;
    otherUser: {
        id: string;
        name?: string | null;
        firstname?: string | null;
        email: string;
    };
};

const checkConversationExistsService = async (
    conversationId: string,
    userId: string
): Promise<ConversationWithOtherUser> => {
    const convExists = await bdd.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true }
    });
    if (!convExists) {
        return throwError(404, 'Conversation non trouvée');
    }

    const conv = await bdd.conversation.findUnique({
        where: { id: conversationId },
        include: {
            members: {
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
            }
        }
    });

    if (!conv) {
        return throwError(404, 'Conversation non trouvée');
    }

    const memberIds = conv.members.map((m) => m.userId);
    if (!memberIds.includes(userId)) {
        return throwError(403, "Accès refusé : vous n'êtes pas membre de cette conversation");
    }

    const otherMember = conv.members.find((m) => m.userId !== userId);
    if (!otherMember) {
        return throwError(500, 'Membre complémentaire introuvable');
    }

    return {
        conversationId: conv.id,
        otherUser: {
            id: otherMember.user.id,
            name: otherMember.user.name,
            firstname: otherMember.user.firstname,
            email: otherMember.user.email
        }
    };
};

export const ConversationServices = {
    findAllUserConversationService,
    findConversationByUserIdService,
    findAllMessageByConversationIdService,
    sendMessageService,
    checkConversationExistsService
}