import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Column, DataTableComponent} from '../../data-table/data-table.component';
import {DynamicModalComponent} from '../../dynamic-modal/dynamic-modal.component';

interface Patient {
  name: string;
  email: string;
  telephone: string;
  status: string;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    DataTableComponent,
    HttpClientModule,
    DynamicModalComponent
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})

export class PatientsComponent implements OnInit {
  showModal = false;
  modalTitle = '';
  modalFields: any[] = [];

  patientsColumns: Column[] = [
    { key: 'name', header: 'Nome', type: 'text' },
    { key: 'email', header: 'E-mail', type: 'text' },
    { key: 'telephone', header: 'Telefone', type: 'text' },
    { key: 'status', header: 'Status', type: 'status' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  patientData: Patient[] = [];  // Dados dos pacientes

  private apiUrl = 'http://localhost:8080/api/patients'; // Substitua pela URL da sua API

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPatients();  // Chama o método para carregar os dados dos pacientes
  }

  // Método para fazer a requisição à API e obter os dados dos pacientes
  loadPatients(): void {
    const token = localStorage.getItem('authToken'); // 🔹 Busca o token salvo

    if (!token) {
      console.error('Token não encontrado!');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Patient[]>(this.apiUrl, { headers }).subscribe((data) => {
      this.patientData = data;
    });
  }

  addRecord(newRecord: any) {
    console.log('Data received:', newRecord);
    this.showModal = false;
  }

}
