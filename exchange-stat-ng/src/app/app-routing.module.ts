import { MainComponent } from './main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { CustomChainComponent } from './custom-chain/custom-chain.component';
import { ChainSettingsComponent } from './chain-settings/chain-settings.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', canActivate: [AuthGuard], canLoad: [AuthGuard], component: MainComponent },
  { path: 'custom-chain', component: CustomChainComponent },
  { path: 'chain-settings', component: ChainSettingsComponent }
];

@NgModule({
  imports: [
    [RouterModule.forRoot(appRoutes)]
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
