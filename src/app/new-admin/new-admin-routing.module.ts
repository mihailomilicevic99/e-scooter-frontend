import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewAdminPage } from './new-admin.page';

const routes: Routes = [
  {
    path: '',
    component: NewAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewAdminPageRoutingModule {}
