import vine from "@vinejs/vine";
import { RequestHandler } from "express";
import { sendSuccess } from "../Utils/returnSuccess/returnSuccess";
import { handleError } from "../Utils/errorHandler/errorHandler";
import { validateData } from "../Utils/validateData/validateData";
import { AuthServices } from "../Services/auth.services";
import { sendEmail } from "../Utils/sendEmail/sendEmail";
import { Infer } from "@vinejs/vine/build/src/types";

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

    const user = req.user;

    if (user) {
        return handleError(new Error("Vous êtes déjà connecté"), req, res, 'AuthController.register');
    }
    try {

        const schemaData = vine.object({
            email: vine.string().email(),
            name: vine.string(),
            firstname: vine.string(),
            password: vine.string().minLength(6).maxLength(30).confirmed(),
        });


        await AuthServices.registerService(await validateData(schemaData, req.body));

        await sendEmail(req.body.email, "kodo.contactpro@gmail.com", "Activation de votre compte", "createAccount/createAccount", { email: req.body.email, siteUrl: process.env.SITE_URL, firstname: req.body.firstname });

        sendSuccess(res, 201, "L'utilisateur a bien été créé");

    } catch (error) {

        handleError(error, req, res, 'AuthController.register');
    }
}

const login: RequestHandler = async (req, res) => {

    const user = req.user;

    if (user) {
        return handleError(new Error("Vous êtes déjà connecté"), req, res, 'AuthController.register');
    }

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

const generatePasswordResetToken: RequestHandler = async (req, res) => {

    const user = req.user;

    if (user) {
        return handleError(new Error("Vous êtes déjà connecté"), req, res, 'AuthController.register');
    }

    const schemaData = vine.object({
        email: vine.string().email()
    })

    try {

        const { token, user } = await AuthServices.generatePasswordResetService(await validateData(schemaData, req.body));

        await sendEmail(user.email, "kodo.contactpro@gmail.com", "Réinitialisation de mot de passe", "resetPassword/resetPassword", { token, firstname: user.firstname, user_id: user.id, siteUrl: process.env.SITE_URL });

        sendSuccess(res, 200, "Un email a été envoyé");

    } catch (error) {

        // Handle the error
        handleError(error, req, res, 'PasswordResetController.generatePasswordResetToken');
    }
}

const checkUserRequest: RequestHandler = async (req, res) => {

    const user = req.user;

    if (user) {
        return handleError(new Error("Vous êtes déjà connecté"), req, res, 'AuthController.register');
    }

    const schemaData = vine.object({
        userId: vine.string().uuid(),
        token: vine.string()
    })

    try {

        await AuthServices.checkUserRequest(await validateData(schemaData, req.query as Infer<typeof schemaData>));

        sendSuccess(res, 200, "Utilisateur existant");

    } catch (error) {

        // Handle the error
        handleError(error, req, res, 'PasswordResetController.checkUserRequest');
    }
}

const changePassword: RequestHandler = async (req, res) => {

    const user = req.user;

    if (user) {
        return handleError(new Error("Vous êtes déjà connecté"), req, res, 'AuthController.register');
    }
    const schemaData = vine.object({
        userId: vine.string().uuid(),
        token: vine.string(),
        password: vine.string().minLength(8).maxLength(30).confirmed(),
    })

    try {

        await AuthServices.changePassword(await validateData(schemaData, req.body as Infer<typeof schemaData>));

        sendSuccess(res, 200, "Mot de passe modifié");

    } catch (error) {

        // Handle the error
        handleError(error, req, res, 'PasswordResetController.changePassword');
    }
}

export const AuthController = {
    register,
    login,
    generatePasswordResetToken,
    checkUserRequest,
    changePassword
}