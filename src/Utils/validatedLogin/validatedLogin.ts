
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import { handleError } from "../../Utils/errorHandler/errorHandler";

/**
 * Middleware function to check JWT authentication.
 *
 * @return Express middleware function
 */
export const checkAuth = () => {
    return (req: Request, res: Response, next: NextFunction) => {

        passport.authenticate("jwt", { session: false }, async (err: Error | null, user: User | false) => {
            // If an error occurs, return an error
            if (err) {

                /* #swagger.responses[500] = { schema: { $ref: '#/definitions/500' } } */
                return handleError({ status: 500, error: "Erreur interne du serveur" }, req, res, 'CheckAuthAndRole');
            }

            // If no user is authenticated or the JWT is invalid, return an error
            if (!user) {

                /* #swagger.responses[401] = { schema: { $ref: '#/definitions/401' } } */
                return handleError({ status: 401, error: "Non autorisé" }, req, res, 'CheckAuthAndRole');
            }


            // Stock in req.user user information
            req.user = user;

            // If the user has the required role or no role is specified, continue to the next middleware
            next();
        })(req, res, next);
    };
};