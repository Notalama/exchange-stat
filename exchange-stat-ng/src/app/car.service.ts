import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Car } from './car';
@Injectable({
  providedIn: 'root'
})
export class CarService {

  constructor(private http: HttpClient) { }

  getCarsSmall() {
    return this.http.get('assets/cars-small.json')
      .toPromise()
      .then((res: any) => <Car[]>res.data)
      .then(data => { return data; });
  }
}
