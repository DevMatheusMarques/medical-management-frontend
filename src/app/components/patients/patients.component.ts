import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Column, DataTableComponent} from '../data-table/data-table.component';
import {ToastService} from '../../shared/services/toast.service';
import Swal from 'sweetalert2';
import {DynamicModalComponent} from '../dynamic-modal/dynamic-modal.component';
import {VerifyDataService} from '../../shared/services/verifyData.service';

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
    DynamicModalComponent,
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})

export class PatientsComponent implements OnInit {
  @Input() selectedTab: string = '';
  @Input() fields: any[] = [];
  viewMode = false;
  showModal = false;
  modalTitle = '';
  modalFields: any[] = [];
  editingPatientId = '';

  patientsColumns: Column[] = [
    { key: 'name', header: 'Nome', type: 'text' },
    { key: 'email', header: 'E-mail', type: 'text' },
    { key: 'telephone', header: 'Telefone', type: 'text' },
    { key: 'status', header: 'Status', type: 'status' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  patientData: Patient[] = [];

  private apiUrl = 'http://localhost:8080/api/patients';

  constructor(private http: HttpClient, private toastService: ToastService, private verifyDataService: VerifyDataService) {}

  ngOnInit(): void {
    this.loadPatients();  // Chama o método para carregar os dados dos pacientes
  }

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

  openModal() {
    this.selectedTab === 'Pacientes'
    this.modalTitle = 'Adicionar Paciente';
    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: '', placeholder: 'Digite o nome do paciente' },
      { label: 'CPF', name: 'cpf', type: 'text', value: '', placeholder: 'Digite o CPF do paciente' },
      { label: 'Data de Aniversário', name: 'birth_date', type: 'date', value: '', placeholder: 'Digite a data de aniversário do paciente' },
      { label: 'E-mail', name: 'email', type: 'email', value: '', placeholder: 'Digite o e-mail do paciente' },
      { label: 'Celular', name: 'telephone', type: 'tel', value: '', placeholder: 'Digite o celular do paciente' },
      { label: 'Endereço', name: 'address', type: 'text', value: '', placeholder: 'Digite o endereço do paciente' },
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

    let formattedDate = '';
    if (formData['birth_date']) {
      const dateObj = new Date(formData['birth_date'] + 'T12:00:00');
      formattedDate = dateObj.toLocaleDateString('pt-BR');
    }

    let dataToSend: any = {
      name: formData['name'],
      cpf: formData['cpf'],
      birth_date: formattedDate,
      email: formData['email'],
      telephone: formData['telephone'],
      address: formData['address'],
      status: 'Ativo',
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = 'http://localhost:8080/api/patients';
    this.http.post(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.loadPatients();
        this.toastService.showToast('Paciente cadastrado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  verifyData(): boolean {
    const allFieldsFilled = this.modalFields.every(field => field.value && field.value.trim() !== '');

    if (!allFieldsFilled) {
      this.toastService.showToast('Todos os campos precisam estar preenchidos!', 'error');
      return false;
    }

    return true;
  }

  editPatient(patient: any): void {
    this.selectedTab = 'Pacientes';
    this.modalTitle = 'Editar Paciente';

    this.editingPatientId = patient.id;

    const formattedDate = patient.birth_date ? formatDateString(patient.birth_date) : '';

    function formatDateString(dateStr: string): string {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString().split('T')[0];
      }
      return new Date(dateStr).toISOString().split('T')[0];
    }

    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: patient.name, placeholder: 'Digite o nome do paciente' },
      { label: 'CPF', name: 'cpf', type: 'text', value: patient.cpf, placeholder: 'Digite o CPF do paciente', disable: true },
      { label: 'Data de Aniversário', name: 'birth_date', type: 'date', value: formattedDate, placeholder: 'Digite a data de aniversário do paciente', disable: true },
      { label: 'E-mail', name: 'email', type: 'email', value: patient.email, placeholder: 'Digite o e-mail do paciente' },
      { label: 'Celular', name: 'telephone', type: 'tel', value: patient.telephone, placeholder: 'Digite o celular do paciente' },
      { label: 'Endereço', name: 'address', type: 'text', value: patient.address, placeholder: 'Digite o endereço do paciente' },
      {
        label: 'Status',
        name: 'status',
        type: 'radio',
        value: patient.status,
        options: [
          { label: 'Ativo', value: 'Ativo' },
          { label: 'Inativo', value: 'Inativo' }
        ]
      }
    ];
    this.viewMode = false;
    this.showModal = true;
  }

  handleSubmitEdit() {
    if (!this.verifyData()) return;

    const formData: any = {};
    this.modalFields.forEach(field => {
      formData[field.name] = field.value;
    });

    let formattedDate = '';
    if (formData['birth_date']) {
      const dateObj = new Date(formData['birth_date'] + 'T12:00:00');
      formattedDate = dateObj.toLocaleDateString('pt-BR');
    }

    let dataToSend: any = {
      name: formData['name'],
      cpf: formData['cpf'],
      birth_date: formattedDate,
      email: formData['email'],
      telephone: formData['telephone'],
      address: formData['address'],
      status: formData['status'],
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `http://localhost:8080/api/patients/${this.editingPatientId}`;
    this.http.put(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.loadPatients();
        this.toastService.showToast('Paciente atualizado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  deletePatient(patient: any): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded",
        actions: "flex justify-center space-x-4"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Tem certeza que deseja excluir este paciente?",
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

        const endpoint = `http://localhost:8080/api/patients/${patient.id}`;
        this.http.delete(endpoint, { headers }).subscribe(
          response => {
            this.loadPatients();
            this.toastService.showToast('Paciente excluído com sucesso!', 'success');
          },
          error => {
            const errorMessage = error.error?.message || 'Erro desconhecido';
            this.toastService.showToast(errorMessage, 'error');
          }
        );
      }
    });
  }

  viewPatient(patient: any): void {
    this.selectedTab = 'Pacientes';
    this.modalTitle = 'Dados do Paciente';

    const formattedDate = patient.birth_date ? formatDateString(patient.birth_date) : '';

    function formatDateString(dateStr: string): string {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString().split('T')[0];
      }
      return new Date(dateStr).toISOString().split('T')[0];
    }

    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: patient.name, disable: true },
      { label: 'CPF', name: 'cpf', type: 'text', value: patient.cpf, disable: true },
      { label: 'Data de Aniversário', name: 'birth_date', type: 'date', value: formattedDate, disable: true },
      { label: 'E-mail', name: 'email', type: 'email', value: patient.email, disable: true },
      { label: 'Celular', name: 'telephone', type: 'tel', value: patient.telephone, disable: true },
      { label: 'Endereço', name: 'address', type: 'text', value: patient.address, disable: true },
      { label: 'Status', name: 'address', type: 'text', value: patient.status, disable: true },
    ];
    this.viewMode = true;
    this.showModal = true;
  }
}
