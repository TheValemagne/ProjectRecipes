import { HttpClient,
         HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject,
         Observable,
         throwError } from "rxjs";
import { catchError,
         tap } from "rxjs/operators";

import { environment } from "src/environments/environment";

import { User } from "./user.model";
import { UserData } from "./userData";

/**
 * Réponse d'une requête de connexion / inscription (voir documentation de l'API)
 */
export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({
    providedIn: "root"
})
export class AuthService {
    user = new BehaviorSubject<User | null>(null);
    authUrl: string = 'https://identitytoolkit.googleapis.com/v1/accounts:';
    firebaseAPIKey = environment.firebaseAPIKey;
    private tokenExpirationTime!: any;

    constructor(private http: HttpClient,
                private router: Router){}

    /**
     * Gestion de l'inscription d'un nouvel utilisateur.
     * 
     * @param inputEmail, l'email du nouveau compte
     * @param inputPassword, le mot de passe du nouveau compte
     * @returns l'observable de la requete http
     */
    signUp(inputEmail: string, inputPassword: string): Observable<AuthResponseData> {
        return this.http
                   .post<AuthResponseData>(this.authUrl + 'signUp?key=' + this.firebaseAPIKey,
                        {
                            email: inputEmail,
                            password: inputPassword,
                            returnSecureToken: true
                        })
                    .pipe(
                        catchError(this.handleError),
                        tap(responseData => this.handleAuthTap(responseData.email,
                                                               responseData.localId,
                                                               responseData.idToken,
                                                               +responseData.expiresIn)
                        ) 
                    );
    }

    /**
     * Gestion de connexion d'un utilisateur.
     * 
     * @param inputEmail, email de l'utilisateur
     * @param inputPassword, mot de passe de l'utilisateur
     * @returns l'observable de la requete http
     */
    signIn(inputEmail: string, inputPassword: string): Observable<AuthResponseData> {
        return this.http
                   .post<AuthResponseData>(this.authUrl + 'signInWithPassword?key=' + this.firebaseAPIKey,
                        {
                            email: inputEmail,
                            password: inputPassword,
                            returnSecureToken: true
                        })
                    .pipe(
                        catchError(this.handleError),
                        tap(responseData => this.handleAuthTap(responseData.email, 
                                                               responseData.localId, 
                                                               responseData.idToken, 
                                                               +responseData.expiresIn)
                        ) 
                    );
    }

    /**
     * Connexion automatique au compte de l'utilisateur authentifié.
     */
    autoSignIn(): void {
        const userData: UserData = this.getUserData();

        if(!userData){
            return;
        }

        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );
        
        if(loadedUser.token){
            this.user.next(loadedUser);

            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoSignOut(expirationDuration);
        }
    }

    /**
     * Déconnexion du compte de l'utilisateur.
     */
    signOut(): void {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        
        if(this.tokenExpirationTime){
            clearTimeout(this.tokenExpirationTime);
        }

        this.tokenExpirationTime = null;
    }

    /**
     * Déconnexion automatique du compte de l'utilisateur après une certaine durée, liée à la durée de vie du token.
     */
    autoSignOut(expirationDuration: number): void {
        if(this.tokenExpirationTime){
            clearTimeout(this.tokenExpirationTime);
        }

        this.tokenExpirationTime = setTimeout( () => {
            this.signOut();
        }, expirationDuration);
    }

    /**
     * Retourne les données du compte de l'utilisateur actuel.
     * 
     * @returns les données de l'utilisateur
     */
    getUserData(): UserData {
        const value = localStorage.getItem('userData');
        return JSON.parse((value)? value : '{}');
    }

    /**
     * Gestion des erreurs d'inscription et de connexion.
     * 
     * @param errorResponse 
     * @returns Observable
     */
    private handleError(errorResponse: HttpErrorResponse): Observable<AuthResponseData> {
        let errorMsg = 'Une erreur s\'est produite.';
        
        if(!errorResponse.error || !errorResponse.error.error){
            return throwError( () => errorMsg);
        }

        switch(errorResponse.error.error.message){
            case 'EMAIL_EXISTS':
                errorMsg = 'L\'email est déjà associé à un compte.';
                break;
            case 'EMAIL_NOT_FOUND':
            case 'INVALID_PASSWORD':
                errorMsg = 'Email ou mot de passe invalide.';
                break;
            case 'MISSING_PASSWORD':
                errorMsg = "Le mot de passe est manquant.";
                break;
            case 'INVALID_ID_TOKEN':
            case 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN':
                errorMsg = 'Votre session a expiré, veuillez-vous reconnecter.';
                break;
            case 'USER_NOT_FOUND':
                errorMsg = 'Le compte n\'a pas été retrouvé. Veuillez vous reconnecter.';
                break;
            default:
                errorMsg = 'Une erreur s\'est produite.';
                break;
        }

        return throwError( () => errorMsg);
    }

    /**
     * Enregistrement des données dans le local storage et mise à jour de l'utilisateur.
     * 
     * @param email, email de l'utilisateur
     * @param userId, identifiant unique de l'utilisateur
     * @param token, token identifiant la session de l'utilisateur
     * @param expiresIn, duree de validité du token
     */
    private handleAuthTap(email: string, userId: string, token: string, expiresIn: number): void {
            const expirationDate = new Date(
                new Date().getTime() + expiresIn * 1000
            );

            const user = new User(
                email,
                userId,
                token,
                expirationDate
            );

            this.user.next(user);
            this.autoSignOut(expiresIn * 1000);
            localStorage.setItem('userData', JSON.stringify(user));
    }
}

