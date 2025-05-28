import { RequestHandler } from "express"
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { User } from "@prisma/client";
import vine from "@vinejs/vine";
import { Infer } from "@vinejs/vine/build/src/types";
import { validateData } from "../Utils/validateData/validateData";
import { FollowerServices } from "../Services/follower.services";

const followUser: RequestHandler = async (req, res) => {

     const schemaData = vine.object({
          userId: vine.string().uuid(),
     });
     const user = req.user as User;

     try {
          await FollowerServices.followUserService(await validateData(schemaData, req.params as Infer<typeof schemaData>), user.id);
          sendSuccess(res, 200, "Utilisateur suivi avec succès");
     } catch (error) {
          handleError(error, req, res, 'FollowerController.followUser');
     }
}

const checkFollow: RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          userId: vine.string().uuid(),
     });

     const user = req.user as User;

     try {
          const isFollowing = await FollowerServices.checkFollowService(await validateData(schemaData, req.params as Infer<typeof schemaData>), user.id);
          sendSuccess(res, 200, "Vérification de suivi réussie", { isFollowing });
     } catch (error) {
          handleError(error, req, res, 'FollowerController.checkFollow');
     }
}

export const FollowerController = {
     followUser,
     checkFollow
}