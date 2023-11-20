import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefugeService } from '../../../services/refuge/refuge.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  GetRefugeFromIdErrors,
  GetRefugeResponse,
} from '../../../../schemas/refuge/get-refuge-schema';
import { match } from 'ts-pattern';
import { Refuge } from '../../../../schemas/refuge/refuge';
import { Night } from '../../../../schemas/reservations/night';
import { ReservationService } from '../../../services/reservations/reservation.service';
import {
  GetReservationsErrors,
  GetReservationsResponse,
} from '../../../../schemas/reservations/get-reservations-schema';
import { Reservation } from '../../../../schemas/reservations/reservation';
import { AuthService } from '../../../services/auth/auth.service';
import {
  GetUserErrors,
  GetUserResponse,
} from '../../../../schemas/auth/get-user-schema';
import { User } from '../../../../schemas/auth/user';

@Component({
  selector: 'app-refuge-detail',
  templateUrl: './refuge-detail.page.html',
  styleUrls: ['./refuge-detail.page.scss'],
})
export class RefugeDetailPage implements OnInit {
  refuge?: Refuge;
  pickedDate = new Date().toISOString();
  private userIds: string[] = [];
  users: User[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private refugeService: RefugeService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private translateService: TranslateService,
    private platform: Platform,
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
      header: this.translateService.instant('HOME.CLIENT_ERROR.HEADER'),
      subHeader: this.translateService.instant('HOME.CLIENT_ERROR.SUBHEADER'),
      message: this.translateService.instant('HOME.CLIENT_ERROR.MESSAGE'),
      buttons: [
        {
          text: this.translateService.instant('HOME.CLIENT_ERROR.EXIT'),
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

  onSearch() {
    const date = this.getDateFromISOString(this.pickedDate);
    const night = this.getNightFromDate(date);
    if (night === null) return;
    this.fetchUserIdsFromNight(night);
  }

  private fetchUserIdsFromNight(night: Night) {
    this.reservationService.getReservationsFrom(night).subscribe({
      next: (response: GetReservationsResponse) =>
        this.handleGetReservationsResponse(response),
      error: () => this.handleClientError().then(),
    });
  }

  private handleGetReservationsResponse(response: GetReservationsResponse) {
    match(response)
      .with({ status: 'correct' }, (response) =>
        this.handleGetReservationsCorrect(response.data),
      )
      .with({ status: 'error' }, (response) =>
        this.handleGetReservationsError(response.error),
      )
      .exhaustive();
  }

  private handleGetReservationsCorrect(data: Reservation[]) {
    data.forEach((reservation: Reservation) => {
      this.userIds.push(reservation.user_id);
    });
    this.fetchUsersFromUserIds();
  }

  private handleGetReservationsError(error: GetReservationsErrors) {
    match(error)
      .with(GetReservationsErrors.UNAUTHORIZED, () => this.handleUnauthorized())
      .with(GetReservationsErrors.FORBIDDEN, () => this.handleForbidden())
      .with(GetReservationsErrors.NOT_FOUND, () =>
        this.handleNotFoundReservations(),
      )
      .with(GetReservationsErrors.UNKNOWN_ERROR, () =>
        this.handleUnknownError(),
      )
      .with(GetReservationsErrors.CLIENT_SEND_DATA_ERROR, () =>
        this.handleBadUserData(),
      )
      .with(
        GetReservationsErrors.PROGRAMMER_SEND_DATA_ERROR,
        GetReservationsErrors.SERVER_INCORRECT_DATA_FORMAT_ERROR,
        () => this.handleBadProgrammerData(),
      );
  }

  private handleUnauthorized() {
    this.finishLoadAnimAndExecute(() =>
      this.router.navigate(['login']).then(),
    ).then();
  }

  private handleForbidden() {
    this.finishLoadAnimAndExecute(() =>
      this.router.navigate(['forbidden']).then(),
    ).then();
  }

  private handleNotFoundReservations() {
    this.finishLoadAnimAndExecute(() =>
      this.router.navigate(['not-found']).then(),
    ).then();
  }

  private getDateFromISOString(date: string): Date {
    return new Date(date);
  }

  private getNightFromDate(date: Date): Night | null {
    if (this.refuge === undefined) return null;
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      refugeId: this.refuge.id,
    };
  }

  private fetchUsersFromUserIds() {
    this.userIds.forEach((userId: string) => {
      this.authService.getUserFrom(userId).subscribe({
        next: (response: GetUserResponse) => {
          this.handleGetUserResponse(response);
        },
        error: () => this.handleClientError().then(),
      });
    });
  }

  private handleGetUserResponse(response: GetUserResponse) {
    match(response)
      .with({ status: 'correct' }, (response) => {
        this.handleGetUserCorrect(response.data);
      })
      .with({ status: 'error' }, (response) => {
        this.handleGetUserError(response.error);
      })
      .exhaustive();
  }

  private handleGetUserCorrect(data: User) {
    this.users.push(data);
    // FIXME: Remove next line, debug only
    console.log(this.users);
  }

  private handleGetUserError(error: GetUserErrors) {
    match(error)
      .with(GetUserErrors.UNAUTHORIZED, () => this.handleUnauthorized())
      .with(GetUserErrors.FORBIDDEN, () => this.handleForbidden())
      .with(GetUserErrors.NOT_FOUND, () => this.handleNotFoundReservations())
      .with(GetUserErrors.UNKNOWN_ERROR, () => this.handleUnknownError())
      .with(GetUserErrors.CLIENT_SEND_DATA_ERROR, () =>
        this.handleBadUserData(),
      )
      .with(
        GetUserErrors.PROGRAMMER_SEND_DATA_ERROR,
        GetUserErrors.SERVER_INCORRECT_DATA_FORMAT_ERROR,
        () => this.handleBadProgrammerData(),
      );
  }

  platformIsWeb(): boolean {
    return this.platform.is('desktop');
  }
}
