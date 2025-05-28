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
               },
               _count: {
                    select: {
                         views: true,
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
               },
               _count: {
                    select: {
                         views: true,
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

     const whereClause: any = {};
     if (categorie) {
          whereClause.categorie = categorie;
     }

     let videos: Video[] = [];

     try {
          videos = await bdd.video.findMany({
               where: whereClause,
               include: {
                    user: {
                         select: {
                              id: true,
                              name: true,
                              email: true,
                              firstname: true
                         }
                    },
                    _count: {
                         select: {
                              views: true,
                         }
                    }
               },
               orderBy: { createdAt: 'desc' },
               skip,
               take: pageSize
          });
     }
     catch (error) {

          console.error("Erreur lors de la récupération des vidéos :", error);
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
                    },
                    _count: {
                         select: {
                              views: true,
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
               },
               _count: {
                    select: {
                         views: true,
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

const deleteVideoService = async (videoId: string, userId: string) => {
     const video = await bdd.video.findUnique({
          where: { id: videoId },
          select: { user_id: true }
     });
     if (!video) {
          throw throwError(404, 'Vidéo non trouvée');
     }
     if (video.user_id !== userId) {
          throw throwError(403, 'Vous n\'êtes pas autorisé à supprimer cette vidéo');
     }
     await bdd.video.delete({
          where: { id: videoId }
     });
     return { message: 'Vidéo supprimée avec succès' };
}

export const VideoServices = {
     createVideoService,
     findAllUserVideosService,
     findVideoByIdService,
     findAllVideosService,
     findVideoByNameService,
     findFollowVideo,
     deleteVideoService
}