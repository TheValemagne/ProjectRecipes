import { Component,
         OnDestroy,
         ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable,
         Subscription } from "rxjs";
         
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthResponseData, 
         AuthService } from "./auth.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'

})
export class AuthComponent implements OnDestroy{
    isLoginMode = true;
    isLoading = false;

    alerSub!: Subscription;
    @ViewChild(PlaceholderDirective, {static: false}) alertMsgHost!: PlaceholderDirective; 

    constructor(private authService: AuthService,
                private router: Router){}

    /**
     * Changement de mode entre l'inscription et la connexion d'un utilisateur.
     */
    onToggleMode(): void {
        this.isLoginMode = !this.isLoginMode;
    }

    /**
     * Soumission du formulaire d'authentification
     * 
     * @param form formulaire d'authentification
     */
    onSubmit(form: NgForm): void {
        const email = form.value.email;
        const password = form.value.password;
        let authObs: Observable<AuthResponseData>;

        this.isLoading = true; // chargement en cours

        if(this.isLoginMode){
            authObs = this.authService.signIn(email, password); // connexion
        } else {
            authObs = this.authService.signUp(email, password); // inscription puis connexion
        }

        authObs.subscribe({
            next: responseData => { // connexion avec succès
                this.isLoading = false; // fin du chargement
                this.router.navigate(['/recipes']);
            },
            error: errorResponse => { // erreur lors de la connexion
                this.showErrorMsg(errorResponse);
                this.isLoading = false; // fin du chargement
            }
        })
    }

    /**
     * Affichage du message d'erreur dans une fenêtre popup.
     * 
     * @param msg le message d'erreur
     */
    private showErrorMsg(msg: string): void {
        const hostViewContainerRef = this.alertMsgHost.viewContainerRef;
        hostViewContainerRef.clear();

        const cmpRef = hostViewContainerRef.createComponent(AlertComponent); // methode avec componentFactoryResolver est obselete
        cmpRef.instance.message = msg;
        
        this.alerSub = cmpRef.instance.closeAlert.subscribe(
            () => {
                this.alerSub.unsubscribe();
                hostViewContainerRef.clear();
            }
        );
    }

    ngOnDestroy(): void {
        if(this.alerSub){
            this.alerSub.unsubscribe();
        }
    }
}
