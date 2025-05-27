import vine from "@vinejs/vine";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { validateData } from "../Utils/validateData/validateData";
import { VideoServices } from "../Services/video.services";
import { User } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import { Infer } from "@vinejs/vine/build/src/types";

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
     interface Request {
          user?: User;
     }
}

const create = async (req: Request & { file: Express.Multer.File }, res: Response): Promise<void> => {

     const schemaData = vine.object({
          title: vine.string(),
          categorie: vine.string(),
     })

     const user = req.user as User;

     try {

          const video = await VideoServices.createVideoService(await validateData(schemaData, req.body), user.id, req.file.buffer);

          sendSuccess(res, 201, "Création de la vidéo", video);

     } catch (error) {
          handleError(error, req, res, 'VideoController.create');
     }
}

const findAllUserVideos = async (req: Request, res: Response): Promise<void> => {

     const user = req.user as User;

     try {
          const videos = await VideoServices.findAllUserVideosService(user.id);

          sendSuccess(res, 200, "Liste des vidéos de l'utilisateur", videos);
     } catch (error) {

          handleError(error, req, res, 'VideoController.findAllUserVideos');
     }
}

const findVideoById: RequestHandler = async (req, res) => {

     const schemaData = vine.object({
          id: vine.string().uuid(),
     })

     try {
          const video = await VideoServices.findVideoByIdService(await validateData(schemaData, req.params as Infer<typeof schemaData>));

          sendSuccess(res, 200, "Vidéo trouvée", video);
     } catch (error) {
          handleError(error, req, res, 'VideoController.findVideoById');
     }
};

export const VideoController = {
     create,
     findAllUserVideos,
     findVideoById
}