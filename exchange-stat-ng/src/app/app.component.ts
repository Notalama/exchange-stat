import { AuthGuardService } from './auth-guard.service';
import { Component } from '@angular/core';
import { StoreService } from './store.service';
import { Notification } from './helpers/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  msgs = [];

  constructor(private guardService: AuthGuardService, private _store: StoreService) {
    this.guardService.activateList();
    this._store.showNotification.subscribe((res: Notification) => {
      console.log(res);
      this.show(res);
    });
  }

  show(notification: Notification) {
    this.msgs.push(notification);
    setTimeout(() => {
      this.hide();
    }, 3000);
  }
  
  hide() {
    this.msgs = [];
  }

}
