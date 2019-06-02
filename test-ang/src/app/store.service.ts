import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private http: HttpClient) {
    
  }

  getChains() {
    const url = `http://localhost:9000/best-change?minBalance=0&minProfit=-1&showExmo=false&ltThreeLinks=false`;
    this.http.get(url).subscribe(res => {
      console.log(res);
    }, err => {
      console.error(err);
    });
  }
}
