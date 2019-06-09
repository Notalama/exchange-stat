import { Pipe, PipeTransform } from '@angular/core';
import { Rate } from '../models/rate';

@Pipe({
  name: 'calcRateSum'
})
export class CalcRateSumPipe implements PipeTransform {

  transform(value: Rate, sum: number): any {
    const res = value.receive > value.give ? sum * value.receive : sum / value.give;
    return res;
  }

}
