import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewAdminPageRoutingModule } from './new-admin-routing.module';

import { NewAdminPage } from './new-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewAdminPageRoutingModule
  ],
  declarations: [NewAdminPage]
})
export class NewAdminPageModule {}
