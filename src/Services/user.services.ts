// ! IMPORTS
import { User } from "@prisma/client"
import { bdd } from "../../config/prismaClient.config";
import { throwError } from "../Utils/errorHandler/errorHandler";

/**
 * Vérifie si un utilisateur existe.
 *
 * @param validateData - Un objet contenant l'id ou l'email de l'utilisateur à vérifier.
 * @param login - Indique si la vérification est effectuée lors d'une tentative de connexion (défaut : false).
 * @returns L'utilisateur existant, ou lance une erreur si l'utilisateur n'existe pas.
 */
const checkExistUser = async (validateData: Pick<User, 'id'> | Pick<User, 'email'>, login = false) => {

    const user = await bdd.user.findUnique({ where: validateData });

    if (!user) return throwError(404, login ? 'Email ou mot de passe incorrect' : 'Utilisateur introuvable');

    return user
}

export const UserServices = {
    checkExistUser,
}