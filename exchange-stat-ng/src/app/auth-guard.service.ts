import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  private isNotEmpty = false;

  constructor() { }

  isEmptyList() {
    return this.isNotEmpty;
  }

  activateList() {
    this.isNotEmpty = true;
  }
}
