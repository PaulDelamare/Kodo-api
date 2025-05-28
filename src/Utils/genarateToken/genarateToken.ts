import crypto from "crypto";

export const generateToken = (bytesSize: number) => {
    return crypto.randomBytes(bytesSize).toString("hex"); // Génère un token sécurisé
}