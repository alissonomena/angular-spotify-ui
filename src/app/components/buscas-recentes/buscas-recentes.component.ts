import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buscas-recentes',
  templateUrl: './buscas-recentes.component.html',
  styleUrls: ['./buscas-recentes.component.scss']
})
export class BuscasRecentesComponent implements OnInit {

  pesquisasRecentes = [
    'Top Metal', 'Heavy Metal', 'Metallica', 'Rock'
  ];

  pesquisa: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  definirPesquisa(p: string) {
    this.pesquisa = p;
  }

  buscar() {
    console.log(this.pesquisa)
  }

}
