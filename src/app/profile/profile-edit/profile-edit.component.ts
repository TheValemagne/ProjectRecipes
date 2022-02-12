import { Component, 
         OnDestroy, 
         OnInit } from "@angular/core";
import { AbstractControl, 
         FormControl, 
         FormGroup, 
         ValidationErrors, 
         ValidatorFn, 
         Validators } from "@angular/forms";
import { ActivatedRoute, 
         Router } from "@angular/router";
import { Subscription } from "rxjs";

import { ProfileService } from "../profile.service";

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit, OnDestroy{
    profileForm!: FormGroup;
    error!: string;
    onChangesSub!: Subscription;
    
    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private profileService: ProfileService){}

    ngOnInit(): void {
        this.initForm();
        this.onChangesSub = this.profileForm.valueChanges.subscribe(response => this.error =''); // l'alert danger disparait automatiquement après modification du formulaire
    }

    private initForm(): void {
        this.profileForm = new FormGroup({
            currentPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
            newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
            repeatPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
        },
        {
            validators: [ 
                this.validNewPassword.bind(this), 
                this.samePasswords.bind(this) 
            ]
        });
    }

    /**
     * Validation du formulaire de changement de mot de passe.
     */
    onSubmit(): void {
        const currentPassword = this.profileForm.get('currentPassword')?.value;
        const newPassword = this.profileForm.get('newPassword')?.value;

        this.profileService.changePassword(currentPassword, newPassword)
                            .subscribe({
                                next: response => this.onCancel(),
                                error: errorResponse => {
                                    if(errorResponse === 'Email ou mot de passe invalide.') { 
                                        // cas pour le mot de passe non valide (la connexion à l'application ne livre pas de message détaillé pour des raisons de sécurité)
                                        this.error = "Le mot de passe actuel est invalide.";
                                    } else {
                                        this.error = errorResponse;
                                    }
                                }
                            });
    }

    /**
     * Annule l'action et/ou retour à la page précédente.
     */
    onCancel(): void {
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }

    /**
     * Verification de formulaire, le nouveau mot de passe doit être différent de l'ancien/actuel.
     */
    validNewPassword: ValidatorFn = (ctrl: AbstractControl):  ValidationErrors | null => { 
        const currentPassword = ctrl.get('currentPassword')?.value;
        const newPassword = ctrl.get('newPassword')?.value;

        if(!currentPassword || !newPassword){ // les champs sont obligatoires
            return null;
        }
        
        return currentPassword !== newPassword? null : {NotValidNewPassword: true};
    }

    /**
     * Verification de formulaire, le nouveau mot de passe et répétez le mot de passe doivent être identiques.
     */
    samePasswords: ValidatorFn = (ctrl: AbstractControl):  ValidationErrors | null => { 
        const newPassword = ctrl.get('newPassword')?.value;
        const repeatPassword = ctrl.get('repeatPassword')?.value;

        if(!newPassword || !repeatPassword){ // les champs sont obligatoires
            return null;
        }

        return newPassword === repeatPassword? null : {NotSamePassword: true};
    }

    ngOnDestroy(): void {
        this.onChangesSub.unsubscribe();
    }
}