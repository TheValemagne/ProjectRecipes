import { Component,  
         OnInit } from "@angular/core";
import { ActivatedRoute, 
         Router } from "@angular/router";

import { ProfileService } from "../profile.service";
import { Profile } from "../profile";

@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.css']
})
export class ProfileDetailComponent implements OnInit {
    profile!: Profile;
    error!: string;

    constructor(private profileService: ProfileService,
                private router: Router,
                private activatedRoute: ActivatedRoute){}

    ngOnInit(): void {
        this.profileService.userProfile()
                            .subscribe({
                                next: profile => {
                                    this.profile = profile;
                                    this.error = '';
                                },
                                error: errorResponse => this.error = errorResponse
                            });
    }

    /**
     * Redirection vers la page de modification du mot de passe.
     */
    onChangePassword(): void {
        this.router.navigate(['edit'], { relativeTo: this.activatedRoute });
    }

    /**
     * Supprimer le compte utilisateur.s
     */
    onDeleteProfile(): void {
        const password = prompt("Pour supprimer définitivement votre compte, veuillez indiquer votre mot de passe actuel : ");
        
        if(password != null){ // l'utilisateur n'a pas annulé l'action
            this.profileService.deleteProfile(password)
                                .subscribe({
                                    next: () => {
                                        this.profileService.signOut();
                                        this.error = '';
                                    },
                                    error: errorResponse => {
                                        if(errorResponse === 'Email ou mot de passe invalide.') { 
                                            // cas pour le mot de passe non valide (la connexion à l'application ne livre pas de message détaillé pour des raisons de sécurité)
                                            this.error = "Le mot de passe est invalide.";
                                        } else {
                                            this.error = errorResponse;
                                        }
                                    }
                                });
        }
    }
}