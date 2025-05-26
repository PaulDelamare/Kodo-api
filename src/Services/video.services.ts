import { User, Video } from "@prisma/client";
import { bdd } from "../../config/prismaClient.config";
import { validateAndUploadVideo } from "../Utils/validateAndUploadVideo/validateAndUploadVideo";


const createVideoService = async (
     video: Pick<Video, 'categorie' | 'title'>,
     userId: User['id'],
     buffer: Buffer
) => {

     const timestamp = Date.now();
     const sanitizedTitle = video.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim();
     const fileName = `${sanitizedTitle}_${timestamp}.mp4`;
     const videoPath = await validateAndUploadVideo(buffer, `uploads/public/videos/${fileName}`);

     return bdd.video.create({
          data: {
               title: video.title,
               categorie: video.categorie,
               videoUrl: videoPath.videoPath,
               thumbnailUrl: videoPath.thumbnailPath,
               user: {
                    connect: { id: userId }
               }
          }
     });
}


const findAllUserVideosService = async (userId: User['id']) => {
     return bdd.video.findMany({
          where: { user_id: userId }
     });
}

const findVideoByIdService = async (validatedData: Pick<Video, 'id'>) => {
     return bdd.video.findUnique({
          where: { id: validatedData.id }
     });
}

export const VideoServices = {
     createVideoService,
     findAllUserVideosService,
     findVideoByIdService
}