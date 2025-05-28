import { bdd } from "../../config/prismaClient.config";

const addVideoViewService = async (videoId: string, userId: string) => {
     const existingView = await bdd.view.findFirst({
          where: {
               videoId,
               userId
          }
     });

     if (existingView) {
          return existingView;
     }

     return bdd.view.create({
          data: {
               videoId,
               userId
          }
     });
}

const findCountViewsByVideoIdService = (videoId: string) => {
     return bdd.view.count({
          where: {
               videoId
          }
     });
}

export const ViewServices = {
     addVideoViewService,
     findCountViewsByVideoIdService
}