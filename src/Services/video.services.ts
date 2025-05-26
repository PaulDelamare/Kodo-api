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
               videoUrl: videoPath,
               user: {
                    connect: { id: userId }
               }
          }
     });
}

export const VideoServices = {
     createVideoService
}