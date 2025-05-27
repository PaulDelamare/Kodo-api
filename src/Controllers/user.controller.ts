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
        handleError(error, req, res, 'UserController.findUserByText');
    }
}

const findUserById: RequestHandler = async (req, res) => {
    const schemaData = vine.object({
        id: vine.string().uuid(),
    });

    try {
        const { id } = await validateData(
            schemaData,
            req.params as unknown as Infer<typeof schemaData>
        );

        const user = await UserServices.findUserById(id);

        if (!user) {
            return handleError(new Error("Utilisateur non trouvé"), req, res, 'UserController.findUserById');
        }

        sendSuccess(res, 200, "Utilisateur trouvé", user);

    } catch (error) {
        handleError(error, req, res, 'UserController.findUserById');
    }
}

export const UserController = {
    getInfo,
    findUserByText,
    findUserById
}