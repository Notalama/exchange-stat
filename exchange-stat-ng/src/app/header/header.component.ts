import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  form: any;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      search: [''],
      orders: [''],
      minProfit: [0.4],
      minBalance: [10],
      exmo: [false],
      fourSteps: [false]
    });
   }

  ngOnInit() {
  }

}
