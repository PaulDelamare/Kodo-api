import { User } from "@prisma/client";
import { hashPassword, verifyPassword } from "../Utils/hashPassword/hashPassword";
import { bdd } from "../../config/prismaClient.config";
import { UserServices } from "./user.services";
import jwt, { JwtPayload } from "jsonwebtoken"

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
 * console.log(result.accessToken); // JWT token string
 * console.log(result.data); // User data without password
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

export const AuthServices = {
    registerService,
    loginService
}
