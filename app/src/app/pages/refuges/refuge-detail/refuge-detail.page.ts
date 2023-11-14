import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefugeService } from '../../../services/refuge/refuge.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  GetRefugeFromIdErrors,
  GetRefugeResponse,
} from '../../../../schemas/refuge/get-refuge-schema';
import { match } from 'ts-pattern';
import { Refuge } from '../../../../schemas/refuge/refuge';

@Component({
  selector: 'app-refuge-detail',
  templateUrl: './refuge-detail.page.html',
  styleUrls: ['./refuge-detail.page.scss'],
})
export class RefugeDetailPage implements OnInit {
  refuge?: Refuge;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private refugeService: RefugeService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private translateService: TranslateService,
  ) {
    const refugeId = this.getRefugeIdFromUrl();
    this.fetchRefuge(refugeId).then();
  }

  ngOnInit() {}

  private async fetchRefuge(refugeId: string | null): Promise<void> {
    if (refugeId != null) this.fetchRefugeFromId(refugeId);
    else this.router.navigate(['login']).then();
  }

  private getRefugeIdFromUrl(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  private fetchRefugeFromId(refugeId: string) {
    this.refugeService.getRefugeFrom(refugeId).subscribe({
      next: (response: GetRefugeResponse) =>
        this.handleGetRefugeResponse(response),
      error: () => this.handleClientError().then(),
    });
  }

  private handleGetRefugeResponse(response: GetRefugeResponse) {
    match(response)
      .with({ status: 'correct' }, (response) => (this.refuge = response.data))
      .with({ status: 'error' }, (response) => {
        this.handleGetError(response.error);
      })
      .exhaustive();
  }

  private handleGetError(error: GetRefugeFromIdErrors) {
    match(error)
      .with(GetRefugeFromIdErrors.NOT_FOUND, () => this.handleNotFoundRefuge())
      .with(GetRefugeFromIdErrors.CLIENT_SEND_DATA_ERROR, () =>
        this.handleBadUserData(),
      )
      .with(GetRefugeFromIdErrors.UNKNOWN_ERROR, () =>
        this.handleUnknownError(),
      )
      .with(
        GetRefugeFromIdErrors.SERVER_INCORRECT_DATA_FORMAT_ERROR,
        GetRefugeFromIdErrors.PROGRAMMER_SEND_DATA_ERROR,
        () => this.handleBadProgrammerData(),
      )
      .exhaustive();
  }

  private async handleClientError() {
    const alert = await this.alertController.create({
      header: this.translateService.instant('HOME.ERRORS.CLIENT_ERROR.HEADER'),
      subHeader: this.translateService.instant(
        'HOME.ERRORS.CLIENT_ERROR.SUBHEADER',
      ),
      message: this.translateService.instant(
        'HOME.ERRORS.CLIENT_ERROR.MESSAGE',
      ),
      buttons: [
        {
          text: this.translateService.instant('HOME.ERRORS.CLIENT_ERROR.EXIT'),
          handler: () => {
            this.alertController.dismiss().then();
            this.fetchRefuge(this.getRefugeIdFromUrl());
          },
        },
      ],
    });
    return await alert.present();
  }

  private handleNotFoundRefuge() {
    this.finishLoadAnimAndExecute(() =>
      this.router
        .navigate(['not-found'], {
          skipLocationChange: true,
        })
        .then(),
    ).then();
  }

  private handleBadProgrammerData() {
    this.finishLoadAnimAndExecute(() =>
      this.router
        .navigate(['programming-error'], {
          skipLocationChange: true,
        })
        .then(),
    ).then();
  }

  private handleBadUserData() {
    this.finishLoadAnimAndExecute(() =>
      this.router
        .navigate(['not-found-page'], {
          skipLocationChange: true,
        })
        .then(),
    ).then();
  }

  private handleUnknownError() {
    this.finishLoadAnimAndExecute(() =>
      this.router
        .navigate(['internal-error-page'], {
          skipLocationChange: true,
        })
        .then(),
    ).then();
  }

  private async finishLoadAnimAndExecute(
    func: (() => void) | (() => Promise<void>),
  ) {
    await this.loadingController.dismiss().then();
    await func();
  }
}
