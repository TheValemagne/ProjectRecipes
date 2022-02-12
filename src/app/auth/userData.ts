/**
 * Interface pour le contenue userData stocké dans le local storage
 */
export interface UserData { 
    email: string;
    id: string;
    _token: string;
    _tokenExpirationDate: string;
}