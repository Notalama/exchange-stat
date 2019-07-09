import { ChainColComponent } from './main/chain-col/chain-col.component';
import { MainComponent } from './main/main.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuardService } from './auth-guard.service';
import { AuthGuard } from './auth-guard';
import { StoreService } from './store.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {CheckboxModule} from 'primeng/checkbox';
import { ChainRateComponent } from './main/chain-col/chain-rate/chain-rate.component';
import { CalcRateSumPipe } from './main/chain-col/calc-rate-sum.pipe';
import { BuildExmoLinkPipe } from './main/chain-col/build-exmo-link.pipe';
import { SettingsFormComponent } from './settings-form/settings-form.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChainColComponent,
    ChainRateComponent,
    CalcRateSumPipe,
    BuildExmoLinkPipe,
    SettingsFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    CheckboxModule,
    TableModule,
    ReactiveFormsModule
  ],
  providers: [StoreService, AuthGuard, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
