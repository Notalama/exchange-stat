import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.sass']
})
export class SettingsFormComponent {

  form: FormGroup;
  currencies = ['UAH', 'RUB', 'EUR', 'USD'];
  exchangers = ['1st', 'another 1st', 'thebest'];

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      inCurr: ['', Validators.required],
      outCurr: ['', Validators.required],
      exchanger: ['', Validators.required],
      days: [''],
      hours: [''],
      mins: ['']
    });

  }
}
