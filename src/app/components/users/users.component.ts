import {Component, Input} from '@angular/core';
import {Column, DataTableComponent} from "../data-table/data-table.component";
import {DynamicModalComponent} from "../dynamic-modal/dynamic-modal.component";
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {ToastService} from '../../shared/services/toast.service';
import Swal from 'sweetalert2';
import {VerifyDataService} from '../../shared/services/verifyData.service';
import { environment } from '../../../environments/environment';
import {GenericDataService} from '../../shared/services/generic-data.service';
import {ActivatedRoute} from '@angular/router';

interface User {
  username: string;
  password: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-users',
  imports: [
      DataTableComponent,
      HttpClientModule,
      DynamicModalComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  @Input() selectedTab: string = '';
  @Input() fields: any[] = [];
  viewMode = false;
  showModal = false;
  modalTitle = '';
  modalFields: any[] = [];
  editingUserId = '';

  usersColumns: Column[] = [
    { key: 'username', header: 'Nome', type: 'text' },
    { key: 'role', header: 'Nível de Acesso', type: 'text' },
    { key: 'status', header: 'Status', type: 'status' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  userData: User[] = [];

  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private dataService: GenericDataService, private route: ActivatedRoute, private http: HttpClient, private toastService: ToastService, private verifyDataService: VerifyDataService) {}

  ngOnInit(): void {
    this.userData = this.route.snapshot.data['data'];
  }

  openModal() {
    this.selectedTab = 'Usuários'
    this.modalTitle = 'Adicionar Usuário';
    this.modalFields = [
      { label: 'Nome', name: 'username', type: 'text', value: '', placeholder: 'Digite o nome do usuário' },
      { label: 'Senha', name: 'password', type: 'password', value: '', placeholder: 'Digite a senha do usuário' },
      {
        label: 'Nível de Acesso',
        name: 'role',
        type: 'radio',
        value: '',
        options: [
          { label: 'Administrador', value: 'Administrador' },
          { label: 'Usuário', value: 'Usuário' }
        ]
      }
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
      login: formData['username'],
      password: formData['password'],
      role: formData['role'],
      status: 'Ativo',
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `${environment.apiUrl}/api/auth/register`;
    this.http.post(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('users');
        this.dataService.get<any[]>('users').subscribe((data) => {
          this.userData = data;
        });
        this.toastService.showToast('Usuário cadastrado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  editUser(user: any): void {
    this.selectedTab = 'Usuários';
    this.modalTitle = 'Editar Usuário';

    this.editingUserId = user.id;

    this.modalFields = [
      { label: 'Nome', name: 'username', type: 'text', value: user.username, disable: true },
      { label: 'Senha', name: 'password', type: 'password', value: '', placeholder: 'Digite a nova senha do usuário' },
      {
        label: 'Nível de Acesso',
        name: 'role',
        type: 'radio',
        value: user.role,
        options: [
          { label: 'Administrador', value: 'Administrador' },
          { label: 'Usuário', value: 'Usuário' }
        ]
      },
      {
        label: 'Status',
        name: 'status',
        type: 'radio',
        value: user.status,
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

    let dataToSend: any = {
      login: formData['username'],
      role: formData['role'],
      status: formData['status'],
    };

    if (formData['password'].trim() !== '') {
      dataToSend.password = formData['password'];
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `${this.apiUrl}/${this.editingUserId}`;
    this.http.put(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('users');
        this.dataService.get<any[]>('users').subscribe((data) => {
          this.userData = data;
        });
        this.toastService.showToast('Usuário atualizado com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  deleteUser(user: any): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded",
        actions: "flex justify-center space-x-4"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Tem certeza que deseja excluir este usuário?",
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

        const endpoint = `${this.apiUrl}/${user.id}`;
        this.http.delete(endpoint, { headers }).subscribe(
          response => {
            this.dataService.clear('users');
            this.dataService.get<any[]>('users').subscribe((data) => {
              this.userData = data;
            });
            this.toastService.showToast('Usuário excluído com sucesso!', 'success');
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
