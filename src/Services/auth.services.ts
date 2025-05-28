import { PasswordResetToken, User } from "@prisma/client";
import { hashPassword, verifyPassword } from "../Utils/hashPassword/hashPassword";
import { bdd } from "../../config/prismaClient.config";
import { UserServices } from "./user.services";
import jwt, { JwtPayload } from "jsonwebtoken"
import { throwError } from "../Utils/errorHandler/errorHandler";
import { generateToken } from "../Utils/genarateToken/genarateToken";

/**
 * Crée un nouvel utilisateur dans la base de données.
 *
 * Cette fonction prend les données validées de l'utilisateur, 
 * hash le mot de passe, puis crée un nouvel enregistrement utilisateur.
 *
 * @param validatedData - Les données validées pour le nouvel utilisateur, incluant email, password, name et firstname.
 * @returns Une promesse qui résout l'utilisateur créé.
 */
const registerService = async (validatedData: Pick<User, 'email' | 'password' | 'name' | 'firstname'> & { password: string }) => {
    const { password, ...userData } = validatedData;
    return await bdd.user.create({ data: { ...userData, password: await hashPassword(validatedData.password) } });
}

/**
 * Authenticates a user with the provided credentials and generates an access token.
 *
 * @param validatedData - An object containing the user's email and password, and optionally a `rememberMe` flag.
 * @returns An object containing the generated access token and the user data (excluding the password).
 * @throws {NotFoundError} If the user does not exist.
 * @throws {AuthenticationError} If the password verification fails.
 *
 * @example
 * const result = await loginService({ email: "user@example.com", password: "password123" });
 */
const loginService = async (validatedData: Pick<User, 'email' | 'password'> & { rememberMe?: true }) => {

    // Find User in DB or return 404
    const user = await UserServices.checkExistUser({ email: validatedData.email }, true);

    await verifyPassword(user.password, validatedData.password);

    // Enlève le mot de passe de la donnée utilisateur
    const { password, ...data } = user;

    const accessToken = generateTokens({ email: data.email }, process.env.JWT_SECRET as string, "30d")

    return { accessToken, data }
}

/**
 * Génère un jeton JWT.
 *
 * @param payload - Les données à inclure dans le jeton.
 * @param secret - La clé secrète utilisée pour signer le jeton.
 * @param expiresIn - La durée de validité du jeton. Peut être "30d", "1d", "15m" ou "12h".
 * @returns Le jeton JWT généré sous forme de chaîne de caractères.
 */
const generateTokens = (payload: JwtPayload, secret: string, expiresIn: "30d" | "1d" | "15m" | "12h") => {
    return jwt.sign(
        payload,
        secret,
        { expiresIn }
    )
}

/**
 * Génére un nouveau token de réinitialisation de mot de passe.
 *
 * La fonction prend en param tre un objet contenant l'email d'un utilisateur.
 * Elle recherche l'utilisateur correspondant dans la base de donn es.
 * Si l'utilisateur n'existe pas, elle renvoie une erreur 200.
 * Sinon, elle génére un nouveau token de réinitialisation de mot de passe,
 * le stocke dans la base de donn es, et le renvoie.
 * @param validatedData - L'email de l'utilisateur.
 * @returns - Les informations du token de réinitialisation de mot de passe.
 */
const generatePasswordResetService = async (validatedData: Pick<User, 'email'>): Promise<{ token: string; user: User }> => {
    const user = await bdd.user.findUnique({ where: validatedData });
    if (!user) return throwError(200, 'Un email a été envoyé');

    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await bdd.$transaction([
        bdd.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        bdd.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } })
    ]);

    return { token, user };
};

const checkUserRequest = async (validatedData: Pick<PasswordResetToken, 'token' | 'userId'>): Promise<void> => {

    const passwordResetToken = await bdd.passwordResetToken.findUnique({
        where: validatedData
    });

    if (!passwordResetToken) {
        return throwError(404, 'Aucune demande de reinitialisation de mot de passe trouvée');
    }
}

const changePassword = async (validatedData: Pick<PasswordResetToken, 'token' | 'userId'> & Pick<User, 'password'>): Promise<void> => {
    const { token, userId, password } = validatedData;

    await checkUserRequest({ token, userId });

    await bdd.user.update({
        where: { id: userId },
        data: { password: await hashPassword(password) }
    });

    await bdd.passwordResetToken.delete({ where: { token } });
}

export const AuthServices = {
    registerService,
    loginService,
    generatePasswordResetService,
    checkUserRequest,
    changePassword
}
