import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { match } from 'ts-pattern';
import { SupervisorCredentials } from '../../../schemas/supervisor/supervisor';
import { AuthenticationResponse } from '../../../schemas/auth/authenticate';
import { Token } from '../../../schemas/auth/token';
import {
  AdminErrors,
  AuthenticationErrors,
  ServerErrors,
} from '../../../schemas/auth/errors';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: SupervisorCredentials = {
    username: '',
    password: '',
  };

  hasError: boolean = false;
  errorMessage: string = '';
  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}

  onLogin(form: NgForm) {
    if (form.invalid) return;
    this.login(this.credentials as SupervisorCredentials);
  }

  private login(credentials: SupervisorCredentials) {
    this.startLoadingAnimation().then(() => {
      this.authService.getToken(credentials).subscribe({
        next: (response: AuthenticationResponse) => {
          this.handleLoginResponse(response);
        },
        error: () => {
          this.handleClientError().then();
        },
      });
    });
  }

  private handleLoginResponse(response: AuthenticationResponse) {
    match(response)
      .with({ status: 'authenticated' }, (response) => {
        this.finishLoadingAnimationAndExecute(async () => {
          const token: Token = response.data;
          await this.authService.authenticate(token);
          this.router.navigate(['/refuges']).then();
        }).then();
      })
      .with({ status: 'error' }, (response) => {
        this.handleError(response.error).then();
      })
      .exhaustive();
  }

  private async handleClientError() {
    const alert = await this.alertController.create({
      header: this.translateService.instant('HOME.CLIENT_ERROR.HEADER'),
      subHeader: this.translateService.instant('HOME.CLIENT_ERROR.SUBHEADER'),
      message: this.translateService.instant('HOME.CLIENT_ERROR.MESSAGE'),
      buttons: [
        {
          text: this.translateService.instant('HOME.CLIENT_ERROR.TRY_AGAIN'),
          handler: () => {
            this.router.navigate(['/login']).then();
          },
        },
      ],
    });
    await this.finishLoadingAnimationAndExecute(
      async () => await alert.present()
    );
  }

  private async handleError(error: AuthenticationErrors) {
    match(error)
      .with(ServerErrors.UNKNOWN_ERROR, () => {
        this.goToInternalErrorPage().then();
      })
      .with(ServerErrors.INCORRECT_DATA_FORMAT, () => {
        this.goToProgrammingErrorPage().then();
      })
      .with(AdminErrors.INCORRECT_PASSWORD, () => {
        this.showErrorAndFinishLoadingAnimation(
          this.translateService.instant(
            'LOGIN.PASSWORD.ERROR_INCORRECT_PASSWORD'
          )
        ).then();
      })
      .with(AdminErrors.USER_NOT_FOUND, () => {
        this.showErrorAndFinishLoadingAnimation(
          'LOGIN.USERNAME.ERROR_NOT_FOUND'
        ).then();
      })
      .exhaustive();
  }

  private async goToProgrammingErrorPage() {
    await this.finishLoadingAnimationAndExecute(async () => {
      await this.router.navigate(['programming-error'], {
        skipLocationChange: true,
      });
    });
  }

  private async goToInternalErrorPage() {
    await this.finishLoadingAnimationAndExecute(async () => {
      await this.router.navigate(['internal-error-page'], {
        skipLocationChange: true,
      });
    });
  }

  private async startLoadingAnimation() {
    const loading = await this.loadingController.create({
      message: this.translateService.instant('LOGIN.LOADING'),
      translucent: true,
    });
    return await loading.present();
  }

  private async finishLoadingAnimationAndExecute(
    callback: (() => void) | (() => Promise<void>)
  ) {
    await this.loadingController.dismiss();
    await callback();
  }

  private async showErrorAndFinishLoadingAnimation(message: string) {
    await this.finishLoadingAnimationAndExecute(() => this.showError(message));
  }

  private showError(message: string) {
    this.hasError = true;
    this.errorMessage = message;
  }
}
