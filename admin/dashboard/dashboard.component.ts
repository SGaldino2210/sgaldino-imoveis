import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <div class="dashboard-cards">
        <div class="card">
          <h2>Imóveis</h2>
          <div class="number">{{totalImoveis}}</div>
        </div>
        
        <div class="card">
          <h2>Leads</h2>
          <div class="number">{{totalLeads}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .dashboard-cards {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-width: 200px;
    }
    .number {
      font-size: 36px;
      font-weight: bold;
      color: #2196F3;
      margin-top: 10px;
    }
  `]
})
export class DashboardComponent {
  totalImoveis = 0;
  totalLeads = 0;

  constructor(private http: HttpClient) {
    this.carregarTotais();
  }

  carregarTotais() {
    this.http.get<any[]>('http://localhost:3000/api/imoveis')
      .subscribe(imoveis => this.totalImoveis = imoveis.length);
    
    this.http.get<any[]>('http://localhost:3000/api/leads')
      .subscribe(leads => this.totalLeads = leads.length);
  }
} 