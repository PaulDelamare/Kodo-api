import { bdd } from "../../config/prismaClient.config"

const saveVideoService = async (validatedData: { videoId: string }, userId: string) => {
     const video = await bdd.video.findUnique({
          where: { id: validatedData.videoId },
          select: {
               id: true,
               title: true,
               user_id: true
          }
     });
     if (!video) {
          throw new Error('Video not found');

     }
     const existingSave = await bdd.savedVideo.findFirst({
          where: {

               userId,
               videoId: validatedData.videoId
          }
     });

     if (existingSave) {
          await bdd.savedVideo.delete({
               where: {
                    userId_videoId: {
                         userId: existingSave.userId,
                         videoId: existingSave.videoId
                    }
               }
          });
          return { message: 'Video removed from saves' };
     }

     const save = await bdd.savedVideo.create({
          data: {
               userId,
               videoId: validatedData.videoId
          }
     });

     return save;
}

const findAllSaveVideosService = async (userId: string) => {
     return bdd.savedVideo.findMany({
          where: {
               userId
          },
          orderBy: {
               savedAt: 'desc'
          },
          include: {
               video: {
                    include: {
                         _count: {
                              select: {
                                   views: true,
                              }
                         }
                    }
               },
               user: {
                    select: {
                         id: true,
                         name: true,
                         email: true,
                         firstname: true
                    }
               }
          }
     });
}

const checkSaveVideoService = async (videoId: string, userId: string): Promise<boolean> => {
     const save = await bdd.savedVideo.findFirst({
          where: {
               userId,
               videoId
          }
     });
     return !!save;
}

export const SaveServices = {
     saveVideoService,
     findAllSaveVideosService,
     checkSaveVideoService
};