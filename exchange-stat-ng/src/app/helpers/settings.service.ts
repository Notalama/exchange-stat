import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private tempHideURL = 'http://localhost:9000/temp-hide';
  constructor(private http: HttpClient) { }

  subminSettings(formData) {
    const params = {
      inCurrencyTitle: formData.inCurr.currencyTitle,
      inCurrencyId: formData.inCurr.currencyId,
      outCurrencyTitle: formData.outCurr.currencyTitle,
      outCurrencyId: formData.outCurr.currencyId,
      changerTitle: formData.changer.exchangerTitle,
      changerId: formData.changer.exchangerId,
      hidePeriod: (formData.days || 0) * 86400000 + (formData.hours || 0) * 3600000 + (formData.minutes || 0) * 60000
    }
    return this.http.post(this.tempHideURL, params);
  }
}
