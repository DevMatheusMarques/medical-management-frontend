import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Column, DataTableComponent} from '../data-table/data-table.component';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {MaskDirective} from '../../shared/directives/mask.directive';
import {ToastService} from '../../shared/services/toast.service';
import Swal from 'sweetalert2';
import {DynamicModalComponent} from '../dynamic-modal/dynamic-modal.component';
import {VerifyDataService} from '../../shared/services/verifyData.service';
import { environment } from '../../../environments/environment';

interface Doctor {
  name: string;
  email: string;
  specialty: {
    id: number;
    name: string;
  };
  crm: string;
  telephone: string;
}

@Component({
  selector: 'app-doctors',
  imports: [
    DataTableComponent,
    HttpClientModule,
    DynamicModalComponent,
  ],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  @Input() selectedTab: string = '';
  @ViewChild(MaskDirective) maskDirective!: MaskDirective;
  showModal = false;
  viewMode = false;
  modalTitle = '';
  modalFields: any[] = [];
  editingDoctorId = '';
  specialtyOptions: any[] = [];
  isDataLoaded = false;

  doctorsColumns: Column[] = [
    { key: 'name', header: 'Nome', type: 'text' },
    { key: 'email', header: 'E-mail', type: 'text' },
    { key: 'crm', header: 'CRM', type: 'text' },
    { key: 'specialty.name', header: 'Especialidade', type: 'text' },
    { key: 'telephone', header: 'Telefone', type: 'text' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  doctorData: Doctor[] = [];

  private apiUrl = `${environment.apiUrl}/api/doctors`;

  constructor(private http: HttpClient, private toastService: ToastService, private verifyDataService: VerifyDataService) {}

  loadSpecialties(): void {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`${environment.apiUrl}/api/specialties`, { headers }).subscribe(data => {
      this.specialtyOptions = data.map(spec => ({
        label: spec.name,
        value: spec.id
      }));
    });
  }

  ngOnInit(): void {
    if (!this.isDataLoaded) {
      this.loadDoctors();
      this.loadSpecialties();
    }
  }

  loadDoctors(): void {
    const token = localStorage.getItem('authToken');

    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Doctor[]>(this.apiUrl, { headers }).subscribe((data) => {
      this.doctorData = data;
      this.isDataLoaded = true;
    });
  }

  openModal() {
    this.selectedTab = 'Médicos'
    this.modalTitle = 'Adicionar Médico';
    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: '', placeholder: 'Digite o nome do médico' },
      { label: 'CRM', name: 'crm', type: 'text', value: '', placeholder: 'Digite o CRM do médico' },
      { label: 'Especialidade', name: 'specialtyId', type: 'select', value: '', placeholder: 'Selecione a especialidade', options: this.specialtyOptions },
      { label: 'E-mail', name: 'email', type: 'email', value: '', placeholder: 'Digite o e-mail do médico' },
      { label: 'Celular', name: 'telephone', type: 'tel', value: '', placeholder: 'Digite o telefone do médico' },
    ];
    this.viewMode = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.viewMode = false;
  }

  handleSubmit() {
    if (!this.verifyDataService.verifyData(this.modalFields, this.selectedTab)) return;

    const formData: any = {};
    this.modalFields.forEach(field => {
      formData[field.name] = field.value;
    });

    let dataToSend: any = {
      name: formData['name'],
      crm: formData['crm'],
      specialty: { id: formData['specialtyId'] },
      email: formData['email'],
      telephone: formData['telephone'],
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.apiUrl, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.isDataLoaded = false;
        this.loadDoctors();
        this.toastService.showToast('Médico cadastrado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  editDoctor(doctor: any): void {
    this.selectedTab = 'Médicos';
    this.modalTitle = 'Editar Médico';

    this.editingDoctorId = doctor.id;

    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: doctor.name, placeholder: 'Digite o nome do médico' },
      { label: 'CRM', name: 'crm', type: 'text', value: doctor.crm, placeholder: 'Digite o CRM do médico' },
      { label: 'Especialidade', name: 'specialtyId', type: 'select', value: doctor.specialty.id, placeholder: 'Selecione a especialidade', options: this.specialtyOptions },
      { label: 'E-mail', name: 'email', type: 'email', value: doctor.email, placeholder: 'Digite o e-mail do médico' },
      { label: 'Celular', name: 'telephone', type: 'tel', value: doctor.telephone, placeholder: 'Digite o telefone do médico' },
    ];
    this.viewMode = false;
    this.showModal = true;
  }

  handleSubmitEdit() {
    if (!this.verifyDataService.verifyData(this.modalFields, this.selectedTab)) return;

    const formData: any = {};
    this.modalFields.forEach(field => {
      formData[field.name] = field.value;
    });

    let dataToSend: any = {
      name: formData['name'],
      crm: formData['crm'],
      specialty: { id: formData['specialtyId'] },
      email: formData['email'],
      telephone: formData['telephone'],
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `${this.apiUrl}/${this.editingDoctorId}`;
    this.http.put(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.isDataLoaded = false;
        this.loadDoctors();
        this.toastService.showToast('Médico atualizado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  deleteDoctor(doctor: any): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded",
        actions: "flex justify-center space-x-4"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Tem certeza que deseja excluir este médico?",
      text: "Essa ação não poderá ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Não, cancelar!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('authToken');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        const endpoint = `${this.apiUrl}/${doctor.id}`;
        this.http.delete(endpoint, { headers }).subscribe(
          response => {
            this.isDataLoaded = false;
            this.loadDoctors();
            this.toastService.showToast('Médico excluído com sucesso!', 'success');
          },
          error => {
            const errorMessage = error.error?.message || 'Erro desconhecido';
            this.toastService.showToast(errorMessage, 'error');
          }
        );
      }
    });
  }
}
