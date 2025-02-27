import { Component, Input, OnInit, HostListener, AfterViewInit, ElementRef } from '@angular/core';
import {NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DynamicModalComponent} from '../dynamic-modal/dynamic-modal.component';
import {HttpClient, HttpHeaders} from '@angular/common/http';

export interface Column {
  key: string;
  header: string;
  type?: 'status' | 'action' | 'text' | 'date';
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  imports: [
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    DynamicModalComponent
  ],
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'Data Table';
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() selectedTab: string = '';
  itemsPerPage: number = 8;
  currentPage = 1;
  totalItems: number = 0;

  constructor(private el: ElementRef, private http: HttpClient) {}

  ngOnInit(): void {
    this.totalItems = this.filteredData.length;
  }

  ngAfterViewInit(): void {
    this.updateItemsPerPage();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.updateItemsPerPage();
  }

  updateItemsPerPage(): void {
    const tableElement = this.el.nativeElement.querySelector('table');
    if (!tableElement) return;

    const rowHeight = 40; // Altura aproximada de cada linha
    const tableHeight = window.innerHeight - tableElement.getBoundingClientRect().top - 100; // Margem de segurança

    // Definir o mínimo de 3 e o máximo de 8 itens por página
    this.itemsPerPage = Math.min(8, Math.max(3, Math.floor(tableHeight / rowHeight)));
  }


  get pages(): number[] {
    const pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  searchTerm: string = '';

  get filteredData(): any[] {
    if (!this.searchTerm) {
      return this.data;
    }
    return this.data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-600';
      case 'inativo':
        return 'bg-red-100 text-red-600';
      // case 'in progress':
      //   return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  onEdit(item: any): void {
    console.log('Edit', item);
  }

  onDelete(item: any): void {
    console.log('Delete', item);
  }

  protected readonly Math = Math;

  modalTitle: string = ''; // Título da modal
  modalFields: any[] = []; // Campos que serão exibidos na modal
  showModal: boolean = false; // Controla a exibição da modal

  openModal() {
    if (this.selectedTab === 'Pacientes') {
      this.modalTitle = 'Adicionar Paciente';
      this.modalFields = [
        { label: 'Nome', name: 'name', type: 'text', value: '', placeholder: 'Digite o nome do paciente' },
        { label: 'CPF', name: 'cpf', type: 'text', value: '', placeholder: 'Digite o CPF do paciente' },
        { label: 'Data de Aniversário', name: 'birth_date', type: 'date', value: '', placeholder: 'Digite a data de aniversário' },
        { label: 'E-mail', name: 'email', type: 'email', value: '', placeholder: 'Digite o e-mail' },
        { label: 'Telefone', name: 'telephone', type: 'tel', value: '', placeholder: 'Digite o telefone' },
        { label: 'Endereço', name: 'address', type: 'text', value: '', placeholder: 'Digite o endereço' },
        {
          label: 'Status',
          name: 'status',
          type: 'radio',
          value: 'Ativo',
          options: [
            { label: 'Ativo', value: 'Ativo' },
            { label: 'Inativo', value: 'Inativo' }
          ]
        }
      ];
    } else if (this.selectedTab === 'Médicos') {
      this.modalTitle = 'Adicionar Médico';
      this.modalFields = [
        { label: 'Nome', name: 'name', type: 'text', value: '', placeholder: 'Digite o nome do médico' },
        { label: 'Especialidade', name: 'specialty', type: 'text', value: '', placeholder: 'Digite a especialidade' },
        { label: 'CRM', name: 'crm', type: 'text', value: '', placeholder: 'Digite o CRM' },
        { label: 'E-mail', name: 'email', type: 'email', value: '', placeholder: 'Digite o e-mail' },
        { label: 'Telefone', name: 'telephone', type: 'tel', value: '', placeholder: 'Digite o telefone' }
      ];
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  private applyCpfMask(value: string): string {
    if (!value) {
      return '';
    }
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
    return value;
  }

  private applyPhoneMask(value: string): string {
    if (!value) {
      return '';
    }
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }

  handleSubmit() {
    const formData: any = {};

    this.modalFields.forEach(field => {
      formData[field.name] = field.value;
    });

    console.log('Dados enviados:', formData);

    const cpf = formData['cpf'];
    const formattedCpf = cpf ? this.applyCpfMask(cpf) : '';
    const telephone = formData['telephone'];
    const formattedTelephone = telephone ? this.applyPhoneMask(telephone) : '';

    // Formatar a data
    let formattedDate = '';
    if (formData['birth_date']) {
      const dateObj = new Date(formData['birth_date']);
      formattedDate = dateObj.toLocaleDateString('pt-BR');
    }

    let dataToSend: any = {
      name: formData['name'],
      cpf: formattedCpf,
      birth_date: formattedDate,
      email: formData['email'],
      telephone: formattedTelephone,
      address: formData['address'],
      status: formData['status'],
    };

    console.log(dataToSend);

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = 'http://localhost:8080/api/patients';
    this.http.post(endpoint, dataToSend, { headers }).subscribe(
      response => {
        console.log('Resposta do backend:', response);
        this.closeModal();
        this.loadData();
      },
      error => {
        console.error('Erro ao enviar dados para o backend:', error);
      }
    );
  }

  loadData() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/patients', { headers }).subscribe(
      response => {
        this.data = response;
        this.totalItems = this.data.length;
      },
      error => {
        console.error('Erro ao carregar dados:', error);
      }
    );
  }
}
