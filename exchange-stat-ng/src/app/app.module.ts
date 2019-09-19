import { BuildKunaLinkPipe } from './main/chain-col/build-kuna-link.pipe';
import { ChainSettingsComponent } from './chain-settings/chain-settings.component';
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
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChainRateComponent } from './main/chain-col/chain-rate/chain-rate.component';
import { CalcRateSumPipe } from './main/chain-col/calc-rate-sum.pipe';
import { BuildExmoLinkPipe } from './main/chain-col/build-exmo-link.pipe';
import { SettingsFormComponent } from './settings-form/settings-form.component';
import { CustomChainComponent } from './custom-chain/custom-chain.component';
import { HeaderComponent } from './header/header.component';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ChainColComponent,
    ChainRateComponent,
    CalcRateSumPipe,
    BuildExmoLinkPipe,
    BuildKunaLinkPipe,
    SettingsFormComponent,
    CustomChainComponent,
    HeaderComponent,
    ChainSettingsComponent
  ],
  imports: [
    BrowserModule,
    // import HttpClientModule after BrowserModule.
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    CheckboxModule,
    TableModule,
    ReactiveFormsModule,
    ButtonModule,
    MessagesModule,
    MessageModule
  ],
  providers: [StoreService, AuthGuard, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
