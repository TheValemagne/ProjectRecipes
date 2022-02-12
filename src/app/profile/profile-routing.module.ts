import { NgModule } from "@angular/core";
import { RouterModule,
         Routes } from "@angular/router";

import { AuthGuard } from "../auth/auth.guard";

import { ProfileComponent } from "./profile.component";
import { ProfileDetailComponent } from "./profile-detail/profile-detail.component";
import { ProfileEditComponent } from "./profile-edit/profile-edit.component";

const routes: Routes = [
    { path: '', component: ProfileComponent, 
      canActivate: [AuthGuard], 
      children: [
        { path: '', component: ProfileDetailComponent },
        { path: 'edit', component: ProfileEditComponent },
        { path: '**', redirectTo: '' }
      ]
    }
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }