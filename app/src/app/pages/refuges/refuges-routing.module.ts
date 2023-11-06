import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefugesListPage } from './refuge-list/refuges-list.page';
import {supervisorGuard} from "../../guards/admin.guard";

const routes: Routes = [
  {
    path: '',
    component: RefugesListPage,
    canActivate: [supervisorGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefugesPageRoutingModule {}
