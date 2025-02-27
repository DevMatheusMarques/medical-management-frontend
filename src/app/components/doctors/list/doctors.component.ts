import {Component, OnInit} from '@angular/core';
import {Column, DataTableComponent} from '../../data-table/data-table.component';
import {DynamicModalComponent} from '../../dynamic-modal/dynamic-modal.component';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';

interface Doctor {
  name: string;
  email: string;
  crm: string;
  telephone: string;
  status: string;
}

@Component({
  selector: 'app-doctors',
  imports: [
    DataTableComponent,
    // DynamicModalComponent,
    HttpClientModule,
    DynamicModalComponent,
  ],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  showModal = false;
  modalTitle = '';
  modalFields: any[] = [];

  doctorsColumns: Column[] = [
    { key: 'name', header: 'Nome', type: 'text' },
    { key: 'email', header: 'E-mail', type: 'text' },
    { key: 'crm', header: 'CRM', type: 'text' },
    { key: 'telephone', header: 'Telefone', type: 'text' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  doctorData: Doctor[] = [];

  private apiUrl = 'http://localhost:8080/api/doctors';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('Token não encontrado!');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Doctor[]>(this.apiUrl, { headers }).subscribe((data) => {
      this.doctorData = data;
    });
  }

  addRecord(newRecord: any) {
    console.log('Data received:', newRecord);
    this.showModal = false;
  }

}
