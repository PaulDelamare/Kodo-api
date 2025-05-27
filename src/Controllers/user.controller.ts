import { User } from "@prisma/client";
import { RequestHandler } from "express"
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { handleError } from "../Utils/errorHandler/errorHandler";
import vine from "@vinejs/vine";
import { Infer } from "@vinejs/vine/build/src/types";
import { validateData } from "../Utils/validateData/validateData";
import { UserServices } from "../Services/user.services";

const getInfo: RequestHandler = async (req, res) => {

    const { password, ...user } = req.user as User;
    sendSuccess(res, 200, "Utilisateur trouvé", user);
}

const findUserByText: RequestHandler = async (req, res) => {
    console.log('herere')
    const schemaData = vine.object({
        text: vine.string().minLength(1).maxLength(50),
    });
    try {

        const { text } = await validateData(
            schemaData,
            req.query as unknown as Infer<typeof schemaData>
        );

        const users = await UserServices.findUserByText(text);

        sendSuccess(res, 200, "Utilisateurs trouvés", users);

    } catch (error) {
        handleError(error, req, res, 'VideoController.findAllVideos');
    }
}

export const UserController = {
    getInfo,
    findUserByText
}