import { User } from "@prisma/client";
import { RequestHandler } from "express"
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";

const getInfo: RequestHandler = async (req, res) => {

    const { password, ...user } = req.user as User;
    sendSuccess(res, 200, "Utilisateur trouvé", user);
}

export const UserController = {
    getInfo
}