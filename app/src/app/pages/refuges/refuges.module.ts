import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefugesPageRoutingModule } from './refuges-routing.module';

import { RefugesListPage } from './refuge-list/refuges-list.page';
import { RefugeDetailPage } from './refuge-detail/refuge-detail.page';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RefugesPageRoutingModule,
        NgOptimizedImage,
        TranslateModule,
    ],
  declarations: [RefugesListPage, RefugeDetailPage],
})
export class RefugesPageModule {}
