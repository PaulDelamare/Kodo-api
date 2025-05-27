import { User, Video } from "@prisma/client";
import { bdd } from "../../config/prismaClient.config";
import { validateAndUploadVideo } from "../Utils/validateAndUploadVideo/validateAndUploadVideo";
import { throwError } from "../Utils/errorHandler/errorHandler";


const createVideoService = async (
     video: Pick<Video, 'categorie' | 'title'>,
     userId: User['id'],
     buffer: Buffer
) => {

     const timestamp = Date.now();
     let sanitizedTitle = video.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim();
     if (!sanitizedTitle) {
          sanitizedTitle = "untitled";
     }
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
          where: { user_id: userId },
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         email: true,
                    }
               }
          }
     });
}

const findVideoByIdService = async (validatedData: Pick<Video, 'id'>) => {
     return bdd.video.findUnique({
          where: { id: validatedData.id },
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         firstname: true,
                         email: true
                    }
               }
          }
     });
}

const findAllVideosService = async (
     page: number,
     pageSize: number = 20,
     categorie?: 'graphisme' | '3d-art' | 'ui-ux'
) => {
     const skip = (page - 1) * pageSize;

     // Construire la clause where
     const whereClause: any = {};
     if (categorie) {
          whereClause.categorie = categorie;
     }

     const videos = await bdd.video.findMany({
          where: whereClause,
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         email: true,
                         firstname: true
                    }
               }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize
     });

     if (videos.length === 0) {
          return throwError(404, 'Vidéos non trouvées');
     }

     return videos;
};

const findVideoByNameService = async (name: string, categorie?: string, userId?: string) => {
     if (categorie === "follow" && userId) {
          return bdd.video.findMany({
               where: {
                    title: {
                         contains: name,
                         mode: 'insensitive'
                    },
                    user: {
                         following: {
                              some: { followerId: userId }
                         }
                    }
               },
               include: {
                    user: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              firstname: true
                         }
                    }
               },
               take: 5
          });
     }

     return bdd.video.findMany({
          where: {
               title: {
                    contains: name,
                    mode: 'insensitive'
               },
               ...(categorie && { categorie })
          },
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         email: true,
                         firstname: true
                    }
               }
          },
          take: 5
     });
}

const findFollowVideo = async (
     userId: string,
     page: number = 1,
     pageSize: number = 20
) => {
     const skip = (page - 1) * pageSize;

     const videos = await bdd.video.findMany({
          where: {
               user: {
                    following: {
                         some: { followerId: userId }
                    }
               }
          },
          include: {
               user: {
                    select: {
                         id: true,
                         name: true,
                         firstname: true,
                         email: true
                    }
               }
          },
          orderBy: {
               createdAt: 'desc'
          },
          skip,
          take: pageSize
     });

     return videos;
}

export const VideoServices = {
     createVideoService,
     findAllUserVideosService,
     findVideoByIdService,
     findAllVideosService,
     findVideoByNameService,
     findFollowVideo
}