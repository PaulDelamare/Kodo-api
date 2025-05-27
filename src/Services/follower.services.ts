import { bdd } from "../../config/prismaClient.config";

const followUserService = async (validateData: { userId: string }, followerId: string) => {
     // Check if the follower is already following the user
     const existingFollow = await bdd.follow.findFirst({
          where: {
               followerId,
               followingId: validateData.userId
          }
     });

     if (existingFollow) {
          // If already following, unfollow (delete the follow relationship)
          await bdd.follow.delete({
               where: {
                    id: existingFollow.id
               }
          });
          return { message: 'Unfollowed the user' };
     }

     // Create a new follow relationship
     const follow = await bdd.follow.create({
          data: {
               followerId,
               followingId: validateData.userId
          }
     });

     return follow;
}

const checkFollowService = async (validateData: { userId: string }, followerId: string): Promise<boolean> => {

     const follow = await bdd.follow.findFirst({
          where: {
               followerId,
               followingId: validateData.userId
          }
     });

     return !!follow;
}
export const FollowerServices = {
     followUserService,
     checkFollowService
}