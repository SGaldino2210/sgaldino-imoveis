import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-imoveis',
  template: `
    <div class="imoveis">
      <h2>Imóveis</h2>
      <button (click)="adicionarImovel()">Adicionar Imóvel</button>
      
      <div class="imoveis-grid">
        <div *ngFor="let imovel of imoveis" class="imovel-card">
          <h3>{{imovel.title}}</h3>
          <p>{{imovel.description}}</p>
          <p>R$ {{imovel.price}}</p>
          <div class="actions">
            <button (click)="editarImovel(imovel)">Editar</button>
            <button (click)="excluirImovel(imovel.id)">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .imoveis { padding: 20px; }
    .imoveis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .imovel-card {
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 4px;
    }
    .actions { margin-top: 10px; }
    button { margin-right: 10px; }
  `]
})
export class ImoveisComponent implements OnInit {
  imoveis: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarImoveis();
  }

  carregarImoveis() {
    this.http.get<any[]>('http://localhost:3000/api/imoveis')
      .subscribe(data => this.imoveis = data);
  }

  adicionarImovel() {
    window.location.href = '/admin/imoveis/adicionar';
  }

  editarImovel(imovel: any) {
    // Implementar edição
  }

  excluirImovel(id: number) {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      this.http.delete(`http://localhost:3000/api/imoveis/${id}`)
        .subscribe(() => this.carregarImoveis());
    }
  }
} 