import { RequestHandler } from "express"
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { validateData } from "../Utils/validateData/validateData";
import { Infer } from "@vinejs/vine/build/src/types";
import vine from "@vinejs/vine";
import { ViewServices } from "../Services/view.services";

const addVideoView: RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          videoId: vine.string().uuid(),
     });

     const user = req.user!;

     try {
          const { videoId } = await validateData(schemaData, req.params as Infer<typeof schemaData>);

          await ViewServices.addVideoViewService(videoId, user.id);

          sendSuccess(res, 200, "Vue de la vidéo ajoutée avec succès");
     } catch (error) {
          handleError(error, req, res, 'ViewController.addVideoView');
     }
}

const findAllViewsByVideoId: RequestHandler = async (req, res) => {
     const schemaData = vine.object({
          videoId: vine.string().uuid(),
     });

     try {
          const { videoId } = await validateData(schemaData, req.params as Infer<typeof schemaData>);

          const views = await ViewServices.findCountViewsByVideoIdService(videoId);

          sendSuccess(res, 200, "Liste des vues de la vidéo", views);
     } catch (error) {
          handleError(error, req, res, 'ViewController.findAllViewsByVideoId');
     }
}

export const ViewController = {
     addVideoView,
     findAllViewsByVideoId
}