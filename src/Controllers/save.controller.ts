import vine from "@vinejs/vine";
import { RequestHandler } from "express"
import { validateData } from "../Utils/validateData/validateData";
import { Infer } from "@vinejs/vine/build/src/types";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { SaveServices } from "../Services/save.services";

const saveVideo: RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          videoId: vine.string().uuid(),
     });

     const user = req.user!;

     try {
          const video = await SaveServices.saveVideoService(await validateData(schemaData, req.params as Infer<typeof schemaData>), user.id);

          sendSuccess(res, 200, "Vidéo sauvegardée avec succès");
     } catch (error) {
          handleError(error, req, res, 'SaveController.saveVideo');
     }
}

const findAllVideoSaved: RequestHandler = async (req, res) => {
     const user = req.user!;
     try {
          const videos = await SaveServices.findAllSaveVideosService(user.id);

          sendSuccess(res, 200, "Liste des vidéos sauvegardées", videos);
     } catch (error) {
          handleError(error, req, res, 'SaveController.findAllVideoSaved');
     }
}

const checkSaveVideo: RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          videoId: vine.string().uuid(),
     });

     const user = req.user!;

     try {
          const { videoId } = await validateData(schemaData, req.params as Infer<typeof schemaData>);

          const isSaved = await SaveServices.checkSaveVideoService(videoId, user.id);

          sendSuccess(res, 200, "Vérification de la sauvegarde de la vidéo réussie", { isSaved });
     } catch (error) {
          handleError(error, req, res, 'SaveController.checkSaveVideo');
     }
}

export const SaveController = {
     saveVideo,
     findAllVideoSaved,
     checkSaveVideo
}