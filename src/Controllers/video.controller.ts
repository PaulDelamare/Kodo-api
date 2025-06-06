import vine from "@vinejs/vine";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { validateData } from "../Utils/validateData/validateData";
import { VideoServices } from "../Services/video.services";
import { User, Video } from "@prisma/client";
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
          categorie: vine.enum(['graphisme', '3d-art', 'ui-ux']),
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

const findAllVideos: RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          page: vine.number().min(1).optional(),
          pageSize: vine.number().min(1).optional(),
          categorie: vine.enum(['graphisme', '3d-art', 'ui-ux', 'follow']).optional(),
     });

     try {
          const { page = 1, pageSize = 20, categorie } = await validateData(
               schemaData,
               req.query as unknown as Infer<typeof schemaData>
          );

          let videos: Video[] = [];

          if (categorie === 'follow') {
               const user = req.user as User;
               videos = await VideoServices.findFollowVideo(user.id, page, pageSize);

          } else {
               videos = await VideoServices.findAllVideosService(
                    page,
                    pageSize,
                    categorie
               );
          }


          sendSuccess(res, 200, 'Liste des vidéos', videos);
     } catch (error) {
          handleError(error, req, res, 'VideoController.findAllVideos');
     }
};

const findVideoByName = async (req: Request, res: Response): Promise<void> => {
     const schemaData = vine.object({
          name: vine.string().minLength(1),
          categorie: vine.enum(['graphisme', '3d-art', 'ui-ux', 'follow']).optional(),
     });

     const user = req.user as User;

     try {
          const { name, categorie } = await validateData(schemaData, req.query as unknown as Infer<typeof schemaData>);

          const video = await VideoServices.findVideoByNameService(name, categorie, user.id);


          sendSuccess(res, 200, "Vidéo trouvée", video);
     } catch (error) {
          handleError(error, req, res, 'VideoController.findVideoByName');
     }
}

const deleteVideo : RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          id: vine.string().uuid(),
     });

     const user = req.user as User;

     try {
          const { id } = await validateData(schemaData, req.params as Infer<typeof schemaData>);

          const video = await VideoServices.deleteVideoService(id, user.id);

          if (!video) {
               return handleError(new Error("Vidéo non trouvée"), req, res, 'VideoController.deleteVideo');
          }

          sendSuccess(res, 200, "Vidéo supprimée avec succès", video);
     } catch (error) {
          handleError(error, req, res, 'VideoController.deleteVideo');
     }
}


export const VideoController = {
     create,
     findAllUserVideos,
     findVideoById,
     findAllVideos,
     findVideoByName,
     deleteVideo
}