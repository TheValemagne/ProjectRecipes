/**
 * Modèle pour les données d'un utilisateur authentifié avec l'API auth de firebase.
 */
export class User {
    /**
     * 
     * @param email adresse mail de l'utilisateur
     * @param id identifiant unique 
     * @param _token le token de l'utilisateur
     * @param _tokenExpirationDate date d'expiration du token
     */
    constructor(public email: string,
                public id: string,
                private _token: string,
                private _tokenExpirationDate: Date) {}

    get token(): string {
        if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
            return '';
        }
        return this._token;
    }
}
