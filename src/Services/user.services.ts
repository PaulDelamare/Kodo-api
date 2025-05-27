// ! IMPORTS
import { Prisma, User } from "@prisma/client"
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

/**
 * Recherche les 5 utilisateurs les plus pertinents dont le prénom et/ou le nom correspondent au texte fourni.
 *
 * @param text - Le texte à rechercher (peut contenir prénom et/ou nom).
 * @returns Les 5 utilisateurs les plus pertinents.
 */
const findUserByText = async (text: string) => {
    const terms = text.trim().split(/\s+/);

    let users = await bdd.user.findMany({
        where: {
            OR: [
                {
                    AND: [
                        { firstname: { contains: terms[0], mode: Prisma.QueryMode.insensitive } },
                        { name: { contains: terms[1] || '', mode: Prisma.QueryMode.insensitive } }
                    ]
                },
                terms.length > 1
                    ? {
                        AND: [
                            { firstname: { contains: terms[1], mode: Prisma.QueryMode.insensitive } },
                            { name: { contains: terms[0], mode: Prisma.QueryMode.insensitive } }
                        ]
                    }
                    : undefined
            ].filter(Boolean) as any
        },
        take: 5,
        select: {
            id: true,
            firstname: true,
            name: true,
            email: true,
        }
    });

    if (users.length < 5) {
        const orConditions = terms.flatMap(term => [
            { firstname: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: term, mode: Prisma.QueryMode.insensitive } }
        ]);

        const extraUsers = await bdd.user.findMany({
            where: {
                OR: orConditions,
                id: { notIn: users.map(u => u.id) }
            },
            take: 5 - users.length,
            select: {
                id: true,
                firstname: true,
                name: true,
                email: true,
            }
        });

        users = users.concat(extraUsers);
    }

    return users;
};

export const UserServices = {
    checkExistUser,
    findUserByText
}