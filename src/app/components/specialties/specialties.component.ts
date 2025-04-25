import {Component, Input, OnInit} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Column, DataTableComponent} from '../data-table/data-table.component';
import {ToastService} from '../../shared/services/toast.service';
import Swal from 'sweetalert2';
import {DynamicModalComponent} from '../dynamic-modal/dynamic-modal.component';
import {VerifyDataService} from '../../shared/services/verifyData.service';
import { environment } from '../../../environments/environment';
import {GenericDataService} from '../../shared/services/generic-data.service';
import {ActivatedRoute} from '@angular/router';

interface Specialty {
  name: string;
}

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [
    DataTableComponent,
    HttpClientModule,
    DynamicModalComponent,
  ],
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.css']
})

export class SpecialtiesComponent implements OnInit {
  @Input() selectedTab: string = '';
  @Input() fields: any[] = [];
  viewMode = false;
  showModal = false;
  modalTitle = '';
  modalFields: any[] = [];
  editingSpecialtyId = '';

  specialtiesColumns: Column[] = [
    { key: 'name', header: 'Nome', type: 'text' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  specialtyData: Specialty[] = [];

  private apiUrl = `${environment.apiUrl}/api/specialties`;

  constructor(private dataService: GenericDataService, private route: ActivatedRoute, private http: HttpClient, private toastService: ToastService, private verifyDataService: VerifyDataService) {}

  ngOnInit(): void {
    this.specialtyData = this.route.snapshot.data['data'];
  }

  openModal() {
    this.selectedTab = 'Especialidades'
    this.modalTitle = 'Adicionar Especialidade';
    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: '', placeholder: 'Digite o nome do especialidade' }
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
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.apiUrl, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('specialties');
        this.dataService.get<any[]>('specialties').subscribe((data) => {
          this.specialtyData = data;
        });
        this.toastService.showToast('Especialidade cadastrada com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  editSpecialty(specialty: any): void {
    this.selectedTab = 'Especialidades';
    this.modalTitle = 'Editar Especialidade';

    this.editingSpecialtyId = specialty.id;

    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: specialty.name, placeholder: 'Digite o nome da especialidade' }
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
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `${this.apiUrl}/${this.editingSpecialtyId}`;
    this.http.put(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('specialties');
        this.dataService.get<any[]>('specialties').subscribe((data) => {
          this.specialtyData = data;
        });
        this.toastService.showToast('Especialidade atualizada com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  deleteSpecialty(specialty: any): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded cursor-pointer",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded me-4 cursor-pointer",
        actions: "flex justify-center"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Tem certeza que deseja excluir esta especialidade?",
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

        const endpoint = `${this.apiUrl}/${specialty.id}`;
        this.http.delete(endpoint, { headers }).subscribe(
          response => {
            this.dataService.clear('specialties');
            this.dataService.get<any[]>('specialties').subscribe((data) => {
              this.specialtyData = data;
            });
            this.toastService.showToast('Especialidade excluído com sucesso!', 'success');
          },
          error => {
            const errorMessage = error.error?.message || 'Erro desconhecido';
            this.toastService.showToast(errorMessage, 'error');
          }
        );
      }
    });
  }

  viewSpecialty(specialty: any): void {
    this.selectedTab = 'Especialidades';
    this.modalTitle = 'Dados do Especialidade';

    this.modalFields = [
      { label: 'Nome', name: 'name', type: 'text', value: specialty.name, placeholder: '', disable: true}
    ];
    this.viewMode = true;
    this.showModal = true;
  }
}
