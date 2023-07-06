import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { AdminComponent } from './admin/admin.component';
import { ProfileComponent } from './profile/profile.component';
import { FaqComponent } from './faq/faq.component';
import { RideHistoryComponent } from './ride-history/ride-history.component';
import { NewAdminComponent } from './new-admin/new-admin.component';
import { AuthGuard } from './auth-guard';

const routes: Routes = [
  {path: '' , component: LoginComponent},
  {path: 'Login' , component: LoginComponent},
  {path: 'Register', component: RegisterComponent},
  {path: 'ForgottenPassword', component: ForgottenPasswordComponent},
  {path: 'AdminPanel', component: AdminComponent, canActivate: [AuthGuard]},
  {path: 'Main', component: MainComponent, canActivate: [AuthGuard]},
  {path: 'Profile', component: ProfileComponent},
  {path: 'Faq', component: FaqComponent},
  {path: 'Ride-history', component: RideHistoryComponent, canActivate: [AuthGuard]},
  {path: 'NewAdmin', component: NewAdminComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
