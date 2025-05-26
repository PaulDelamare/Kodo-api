import { User } from "@prisma/client"
import argon2 from "argon2"
import { throwError } from "../errorHandler/errorHandler"

/**
 * Hashes a password using the Argon2 algorithm.
 *
 * @param password - The plain text password to be hashed.
 * @returns A promise that resolves to the hashed password string.
 */
export const hashPassword = async (password: User['password']): Promise<User['password']> => {
    return await argon2.hash(password)
}

/**
 * Verifies that a given password matches a given hash.
 *
 * @param password - The plain text password to be verified.
 * @param hash - The hash string to compare against.
 * @returns A promise that resolves to a boolean indicating whether the password matches the hash.
 */
export const verifyPassword = async (hash: User['password'], password: User['password']): Promise<true> => {
    return await argon2.verify(hash, password) || throwError(400, 'Email ou mot de passe incorrect*');
}
