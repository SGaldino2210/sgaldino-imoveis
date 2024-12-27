import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ImoveisComponent } from './imoveis/imoveis.component';
import { LeadsComponent } from './leads/leads.component';
import { ConfiguracoesComponent } from './configuracoes/configuracoes.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'imoveis', component: ImoveisComponent },
  { path: 'leads', component: LeadsComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ImoveisComponent,
    LeadsComponent,
    ConfiguracoesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 