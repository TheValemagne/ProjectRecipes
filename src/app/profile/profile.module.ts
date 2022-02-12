import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { ProfileComponent } from "./profile.component";
import { ProfileDetailComponent } from "./profile-detail/profile-detail.component";
import { ProfileEditComponent } from "./profile-edit/profile-edit.component";

import { ProfileRoutingModule } from "./profile-routing.module";

@NgModule({
    declarations: [
        ProfileComponent,
        ProfileDetailComponent,
        ProfileEditComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProfileRoutingModule
    ]
})
export class ProfileModule { }
