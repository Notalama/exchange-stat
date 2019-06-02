import { MainComponent } from './main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth-guard';

const appRoutes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', canActivate: [AuthGuard], canLoad: [AuthGuard], component: MainComponent }
];

@NgModule({
  imports: [
    [RouterModule.forRoot(appRoutes)]
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
