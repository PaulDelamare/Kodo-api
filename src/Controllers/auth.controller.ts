import vine from "@vinejs/vine";
import { RequestHandler } from "express";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { validateData } from "../Utils/validateData/validateData";
import { AuthServices } from "../Services/auth.services";

/**
 * Gère l'inscription d'un utilisateur.
 *
 * Valide le corps de la requête entrante à l'aide d'un schéma, puis appelle le service d'inscription.
 * En cas de succès, envoie une réponse de succès. En cas d'échec, gère et journalise l'erreur.
 *
 * @param req - Objet requête Express contenant les données d'inscription de l'utilisateur.
 * @param res - Objet réponse Express utilisé pour envoyer la réponse.
 * @returns Promise<void>
 *
 * @remarks
 * Le corps de la requête doit inclure les champs `email`, `name`, `firstname` et `password`.
 * Le mot de passe doit contenir entre 6 et 30 caractères et être confirmé.
 */
const register: RequestHandler = async (req, res) => {
    try {

        const schemaData = vine.object({
            email: vine.string().email(),
            name: vine.string(),
            firstname: vine.string(),
            password: vine.string().minLength(6).maxLength(30).confirmed(),
        });


        await AuthServices.registerService(await validateData(schemaData, req.body));

        // Pet-être pour plus tard pour flex
        // await sendEmail(req.body.email, "posware.service@gmail.com", "Activation de votre compte", "createAccount/createAccount", { password: randomPassword, email: req.body.email, siteUrl: process.env.SITE_URL, firstname: req.body.firstname });

        sendSuccess(res, 201, "L'utilisateur a bien été crée");

    } catch (error) {

        handleError(error, req, res, 'AuthController.register');
    }
}

const login: RequestHandler = async (req, res) => {

    try {
        const schemaData = vine.object({
            email: vine.string().email(),
            password: vine.string().minLength(6).maxLength(30),
        });

        const { data, accessToken } = await AuthServices.loginService(await validateData(schemaData, req.body));


        sendSuccess(res, 200, "L'utilisateur s'est connecté avec succès", { user: data, accessToken });

    } catch (error) {
        handleError(error, req, res, 'AuthController.login');
    }
}

export const AuthController = {
    register,
    login
}