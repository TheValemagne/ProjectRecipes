/**
 * Interface contenant les informations du compte de l'utilisateur stocké dans Firebase.
 */
export interface Profile {
    localId: string,
    email: string,
    emailVerified: boolean,
    displayName: string,
    providerUserInfo: Object[],
    photoUrl: string,
    passwordHash: string,
    passwordUpdatedAt: number,
    validSince: string,
    disabled: string,
    lastLoginAt: string,
    createdAt: string,
    customAuth: string
}