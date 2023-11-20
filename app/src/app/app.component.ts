import { Component } from '@angular/core';
import { DeviceLanguageService } from './services/language/device-language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private translateService: TranslateService,
    private deviceLanguageService: DeviceLanguageService,
  ) {
    this.deviceLanguageService.getLanguageCode().subscribe((languageCode) => {
      this.translateService.use(languageCode);
    });
  }
}
