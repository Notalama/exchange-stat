import { MainComponent } from './main/main.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuardService } from './auth-guard.service';
import { AuthGuard } from './auth-guard';
import { StoreService } from './store.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {
  ContextMenuModule,
  DataGridModule,
  DataListModule,
  DataScrollerModule,
  DropdownModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    // DropdownModule,
    // ContextMenuModule,
    // DataGridModule,
    // DataListModule,
    // DataScrollerModule,
    TableModule
  ],
  providers: [StoreService, AuthGuard, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
