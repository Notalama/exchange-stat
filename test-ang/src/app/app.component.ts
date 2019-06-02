import { AuthGuardService } from './auth-guard.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor(private guardService: AuthGuardService) {
    this.guardService.activateList();
  }
}
