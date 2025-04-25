import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Column, DataTableComponent} from '../data-table/data-table.component';
import {ToastService} from '../../shared/services/toast.service';
import Swal from 'sweetalert2';
import {DynamicModalComponent} from '../dynamic-modal/dynamic-modal.component';
import {VerifyDataService} from '../../shared/services/verifyData.service';
import { environment } from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {GenericDataService} from '../../shared/services/generic-data.service';

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

  private apiUrl = `${environment.apiUrl}/api/patients`;

  constructor(private dataService: GenericDataService, private route: ActivatedRoute, private http: HttpClient, private toastService: ToastService, private verifyDataService: VerifyDataService) {}

  ngOnInit(): void {
    this.patientData = this.route.snapshot.data['data'];
  }

  handleCepBlur(event: any) {
    const cep = event.target.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`http://168.231.89.199:8080/api/cep/${cep}`, { headers }).subscribe(
      (data) => {
        this.modalFields.forEach(field => {
          if (field.name === 'street') field.value = data.logradouro;
          if (field.name === 'complement') field.value = data.complemento;
          if (field.name === 'neighborhood') field.value = data.bairro;
          if (field.name === 'city') field.value = data.localidade;
          if (field.name === 'state') field.value = data.uf;
        });
      },
      (err) => {
        this.toastService.showToast('CEP não encontrado!', 'error');
      }
    );
  }

  openModal() {
    this.selectedTab = 'Pacientes'
    this.modalTitle = 'Adicionar Paciente';
    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: '', placeholder: 'Digite o nome do paciente' },
      { label: 'CPF', name: 'cpf', type: 'text', value: '', placeholder: 'Digite o CPF do paciente' },
      { label: 'Data de Aniversário', name: 'birth_date', type: 'date', value: '' },
      { label: 'E-mail', name: 'email', type: 'email', value: '', placeholder: 'Digite o e-mail do paciente' },
      { label: 'Celular', name: 'telephone', type: 'tel', value: '', placeholder: 'Digite o celular do paciente' },
      { label: 'CEP', name: 'zip_code', type: 'text', value: '', placeholder: 'Digite o CEP', onBlur: this.handleCepBlur.bind(this) },
      { label: 'Rua', name: 'street', type: 'text', value: '', placeholder: 'Rua' },
      { label: 'Número', name: 'address_number', type: 'text', value: '', placeholder: 'Número' },
      { label: 'Complemento', name: 'complement', type: 'text', value: '', placeholder: 'Complemento' },
      { label: 'Bairro', name: 'neighborhood', type: 'text', value: '', placeholder: 'Bairro' },
      { label: 'Cidade', name: 'city', type: 'text', value: '', placeholder: 'Cidade' },
      { label: 'Estado', name: 'state', type: 'text', value: '', placeholder: 'Estado' },
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
      address: {
        cep: formData['zip_code'],
        logradouro: formData['street'],
        complemento: formData['complement'],
        bairro: formData['neighborhood'],
        localidade: formData['city'],
        uf: formData['state']
      },
      address_number: formData['address_number'],
      status: 'Ativo',
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.apiUrl, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('patients');
        this.dataService.get<any[]>('patients').subscribe((data) => {
          this.patientData = data;
        });
        this.toastService.showToast('Paciente cadastrado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
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
      { label: 'CEP', name: 'zip_code', type: 'text', value: patient.address?.zipCode || '', placeholder: 'Digite o CEP', onBlur: this.handleCepBlur.bind(this) },
      { label: 'Rua', name: 'street', type: 'text', value: patient.address?.street || '', placeholder: 'Rua' },
      { label: 'Número', name: 'address_number', type: 'text', value: patient.address_number || '', placeholder: 'Número' },
      { label: 'Complemento', name: 'complement', type: 'text', value: patient.address?.complement || '', placeholder: 'Complemento' },
      { label: 'Bairro', name: 'neighborhood', type: 'text', value: patient.address?.neighborhood || '', placeholder: 'Bairro' },
      { label: 'Cidade', name: 'city', type: 'text', value: patient.address?.city || '', placeholder: 'Cidade' },
      { label: 'Estado', name: 'state', type: 'text', value: patient.address?.state || '', placeholder: 'Estado' },
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
      address: {
        cep: formData['zip_code'],
        logradouro: formData['street'],
        complemento: formData['complement'],
        bairro: formData['neighborhood'],
        localidade: formData['city'],
        uf: formData['state']
      },
      address_number: formData['address_number'],
      status: formData['status'],
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `${this.apiUrl}/${this.editingPatientId}`;
    this.http.put(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('patients');
        this.dataService.get<any[]>('patients').subscribe((data) => {
          this.patientData = data;
        });
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
        confirmButton: "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded cursor-pointer",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded me-4 cursor-pointer",
        actions: "flex justify-center"
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

        const endpoint = `${this.apiUrl}/${patient.id}`;
        this.http.delete(endpoint, { headers }).subscribe(
          response => {
            this.dataService.clear('patients');
            this.dataService.get<any[]>('patients').subscribe((data) => {
              this.patientData = data;
            });
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
      { label: 'Nome', name: 'name', type: 'text', value: patient.name, placeholder: '', disable: true },
      { label: 'CPF', name: 'cpf', type: 'text', value: patient.cpf, placeholder: '', disable: true },
      { label: 'Data de Aniversário', name: 'birth_date', type: 'date', value: formattedDate, placeholder: '', disable: true },
      { label: 'E-mail', name: 'email', type: 'email', value: patient.email, placeholder: '', disable: true },
      { label: 'Celular', name: 'telephone', type: 'tel', value: patient.telephone, placeholder: '', disable: true },
      { label: 'CEP', name: 'zip_code', type: 'text', value: patient.address?.zipCode || '', placeholder: '', disable: true },
      { label: 'Rua', name: 'street', type: 'text', value: patient.address?.street || '', placeholder: '', disable: true },
      { label: 'Número', name: 'address_number', type: 'text', value: patient.address_number || '', placeholder: '', disable: true },
      { label: 'Complemento', name: 'complement', type: 'text', value: patient.address?.complement || '', placeholder: '', disable: true },
      { label: 'Bairro', name: 'neighborhood', type: 'text', value: patient.address?.neighborhood || '', placeholder: '', disable: true },
      { label: 'Cidade', name: 'city', type: 'text', value: patient.address?.city || '', placeholder: '', disable: true },
      { label: 'Estado', name: 'state', type: 'text', value: patient.address?.state || '', placeholder: '', disable: true },
      {
        label: 'Status',
        name: 'status',
        type: 'radio',
        value: patient.status,
        disable: true,
        options: [
          { label: 'Ativo', value: 'Ativo' },
          { label: 'Inativo', value: 'Inativo' }
        ],
      }
    ];
    this.viewMode = true;
    this.showModal = true;
  }
}
