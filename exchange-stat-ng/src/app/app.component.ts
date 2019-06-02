import { AuthGuardService } from './auth-guard.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  constructor(private guardService: AuthGuardService) {
    this.guardService.activateList();
  }
}
