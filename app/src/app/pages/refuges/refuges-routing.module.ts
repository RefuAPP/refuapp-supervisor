import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefugesListPage } from './refuge-list/refuges-list.page';
import { supervisorGuard } from '../../guards/supervisor.guard';
import { RefugeDetailPage } from './refuge-detail/refuge-detail.page';

const routes: Routes = [
  {
    path: '',
    component: RefugesListPage,
    canActivate: [supervisorGuard],
  },
  {
    path: ':id',
    component: RefugeDetailPage,
    canActivate: [supervisorGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefugesPageRoutingModule {}
