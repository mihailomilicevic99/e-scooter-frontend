import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { AdminComponent } from './admin/admin.component';
import { FaqComponent } from './faq/faq.component';
import { ProfileComponent } from './profile/profile.component';
import { RideHistoryComponent } from './ride-history/ride-history.component';
import { FormsModule } from '@angular/forms';
import { NewAdminComponent } from './new-admin/new-admin.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    RegisterComponent,
    ForgottenPasswordComponent,
    AdminComponent,
    FaqComponent,
    ProfileComponent,
    RideHistoryComponent,
    NewAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleMapsModule,
    FormsModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
