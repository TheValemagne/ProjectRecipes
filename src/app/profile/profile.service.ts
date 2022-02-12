import { HttpClient,
         HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable,
         throwError  } from "rxjs";
import { catchError,
         map,
         switchMap,
         tap } from "rxjs/operators";

import { AuthService } from "../auth/auth.service";
import { User } from "../auth/user.model";
import { UserData } from "../auth/userData";
import { Profile } from "./profile";

/**
 * Réponse envoyé par l'API de Firebase après un changement de mot de passe.
 */
export interface ChangedPwdAnswer {
    localId: string;
    email: string;
    passwordHash: string;
    prodiderUserInfo: Object[];
    idToken: string;
    refreshToken: string;
    expiresIn: string;
}

@Injectable({
    providedIn: "root"
})
export class ProfileService {
    constructor(private http: HttpClient,
                private authService: AuthService){}
    
    /**
     * Récupération des données de l'utilisateur.
     * 
     * @returns Observable
     */
    userProfile(): Observable<Profile> {
        return  this.http
                    .post<{users : Profile[]}>(this.authService.authUrl + 'lookup?key=' + this.authService.firebaseAPIKey,
                        {
                            idToken: this.authService.getUserData()._token
                        }
                    ).pipe(
                        catchError(this.handleError),
                        map(profiles => profiles['users'][0])
                    );
    }

    /**
     * Modification du mot de passe du compte de l'utilisateur.
     * 
     * @param currentPassword mot de passe actuel
     * @param newPassword nouveau mot de passe
     * @returns Observable
     */
    changePassword(currentPassword: string, newPassword: string): Observable<ChangedPwdAnswer> {
        const email =  this.authService.getUserData().email; // l'email est stocké dans le local storage

        return this.authService
                    .signIn(email, currentPassword) // reconnexion obligatoire pour modifier le compte utilisateur
                    .pipe(
                        switchMap(
                            authResponse =>
                                this.http
                                    .post<ChangedPwdAnswer>(this.authService.authUrl + 'update?key=' + this.authService.firebaseAPIKey,
                                        {
                                            idToken: authResponse.idToken,
                                            password: newPassword,
                                            returnSecureToken: true
                                        }
                                    )
                                    .pipe(
                                        catchError(this.handleError),
                                        tap( (response: ChangedPwdAnswer) => this.handleChangePwd(
                                                                                response.idToken,
                                                                                +response.expiresIn
                                                                            )
                                        )
                                    )
                        )
                    );
    }

    /**
     * Suppression du compte de l'utilisateur.
     * 
     * @param password mot de passe du compte
     * @returns Observable
     */
    deleteProfile(password: string): Observable<void> {
        const email =  this.authService.getUserData().email; // l'email est stocké dans le local storage

        return this.authService
                    .signIn(email, password) // reconnexion obligatoire pour modifier le compte utilisateur
                    .pipe(
                        switchMap(
                            authResponse => 
                                this.http
                                    .post<void>(this.authService.authUrl + 'delete?key=' + this.authService.firebaseAPIKey,
                                        {
                                            idToken: authResponse.idToken
                                        }
                                    )
                                    .pipe(
                                        catchError(this.handleError)
                                    )
                        )
                    );
    }

    /**
     * Déconnexion du compte de l'utilisateur.
     */
    signOut() {
        this.authService.signOut();
    }

    /**
     * Enregistrement des données dans le local storage et mise à jour de l'utilisateur après modification du mot de passe.
     * 
     * @param token 
     * @param expiresIn 
     */
    private handleChangePwd(token: string, expiresIn: number): void {
        const userData: UserData = this.authService.getUserData();

        const user = new User(
            userData.email,
            userData.id,
            token,
            new Date(new Date().getTime() + expiresIn * 1000)
        )

        this.authService.user.next(user);
        this.authService.autoSignOut(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

     /**
     * Gestion des erreurs de modification du profile.
     * 
     * @param errorResponse 
     * @returns Observable
     */
    private handleError(errorResponse: HttpErrorResponse): Observable<any> {
        let errorMsg = 'Une erreur s\'est produite.';
        
        if(!errorResponse.error || !errorResponse.error.error){
            return throwError( () => errorMsg);
        }

        switch(errorResponse.error.error.message){
            case 'INVALID_ID_TOKEN':
            case 'TOKEN_EXPIRED':
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
}

