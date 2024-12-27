import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="logo">
          <h1>SGaldino Admin</h1>
        </div>
        <div class="menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <i class="fas fa-chart-line"></i> Dashboard
          </a>
          <a routerLink="/imoveis" routerLinkActive="active">
            <i class="fas fa-home"></i> Imóveis
          </a>
          <a routerLink="/leads" routerLinkActive="active">
            <i class="fas fa-users"></i> Leads
          </a>
          <a routerLink="/configuracoes" routerLinkActive="active">
            <i class="fas fa-cog"></i> Configurações
          </a>
        </div>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      padding: 20px;
    }
    .menu {
      margin-top: 20px;
    }
    .menu a {
      display: block;
      color: white;
      text-decoration: none;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    .menu a:hover {
      background: #34495e;
    }
    .menu a.active {
      background: #3498db;
    }
    .content {
      flex: 1;
      padding: 20px;
    }
  `]
})
export class AppComponent {} 