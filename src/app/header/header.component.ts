import { Component,
         OnDestroy,
         OnInit} from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy{
  collapsed: boolean = true;
  isAuth = false;
  email!: string;
  private authUserSub!: Subscription;

  constructor(private dataStorageService: DataStorageService,
              private authService: AuthService){}

  ngOnInit(): void {
    this.authUserSub = this.authService.user.subscribe(
      user => {
        this.isAuth = !!user; // utilisateur authentifié ?
        this.email = (!!user)? user?.email : '';
      }
    );
  }

  /**
   * Enregistre les changements de la liste de recettes dans la base de données.
   */
  onSaveData(): void {
    this.dataStorageService.storeRecipes();
  }

  /**
   * Récupère la liste de recettes dans la base de données.
   */
  onRetrieveData(): void {
    this.dataStorageService.retrieveRecipes()
                           .subscribe();
  }

  /**
   * Déconnexion du compte utilisateur
   */
  onSignOut(): void {
    this.authService.signOut();
  }

  ngOnDestroy(): void {
    this.authUserSub.unsubscribe();
  }
}
