import {Component, Input, OnInit, HostListener, AfterViewInit, ElementRef, Output, EventEmitter} from '@angular/core';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ToastService} from '../../shared/services/toast.service';

export interface Column {
  key: string;
  header: string;
  type?: 'status' | 'action' | 'text' | 'date' | 'time' | 'password' | 'search' ;
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
    NgIf,
  ],
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'Data Table';
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() selectedTab: string = '';
  @Input() modal: string = '';
  @Output() addClickedView = new EventEmitter<void>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() addClickedEdit = new EventEmitter<void>();
  @Output() addClickedRemove = new EventEmitter<void>();
  @Output() addClickedSendMessage = new EventEmitter<void>();
  itemsPerPage: number = 8;
  currentPage = 1;
  totalItems: number = 0;
  onlyToday = false;

  constructor(private el: ElementRef, private http: HttpClient,  private toastService: ToastService) {}

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

  toggleTodayFilter() {
    this.onlyToday = !this.onlyToday;
  }

  updateItemsPerPage(): void {
    const tableElement = this.el.nativeElement.querySelector('table');
    if (!tableElement) return;

    const rowHeight = 40; // Altura aproximada de cada linha
    const tableHeight = window.innerHeight - tableElement.getBoundingClientRect().top - 100; // Margem de segurança

    // Mínimo de 3 e o máximo de 8 itens por página
    this.itemsPerPage = Math.min(8, Math.max(3, Math.floor(tableHeight / rowHeight)));
  }


  get pages(): number[] {
    const pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
    const maxButtons = 5;

    if (pageCount <= maxButtons) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const pages = [];
    const middle = Math.floor(maxButtons / 2);

    let start = Math.max(1, this.currentPage - middle);
    let end = Math.min(pageCount, this.currentPage + middle);

    if (start === 1) {
      end = maxButtons;
    }
    if (end === pageCount) {
      start = pageCount - maxButtons + 1;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  searchTerm: string = '';

  get filteredData(): any[] {
    let filteredData = this.searchTerm
      ? this.data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
      : [...this.data];

    if (this.selectedTab === 'Consulta' && this.onlyToday) {
      const today = new Date();
      const todayFormatted = today.toLocaleDateString('pt-BR');

      filteredData = filteredData.filter(item => item.date === todayFormatted);
    }

    filteredData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Ordenação do mais recente para o mais antigo
    });

    this.totalItems = filteredData.length;
    return filteredData;
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Ativo':
      case 'Finalizada':
        return 'bg-green-100 text-green-600';
      case 'Inativo':
      case 'Cancelada':
        return 'bg-red-100 text-red-600';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  onView(item: any, event: Event): void {
    if ((event.target as HTMLElement).tagName !== 'BUTTON') {
      this.addClickedView.emit(item)
    }
  }

  onEdit(item: any): void {
    this.addClickedEdit.emit(item);
  }

  onDelete(item: any): void {
    this.addClickedRemove.emit(item);
  }

  onSendMessage(item: any) {
    this.addClickedSendMessage.emit(item);
  }

  protected readonly Math = Math;

  onAddClick() {
    this.addClicked.emit();
  }

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : null, obj);
  }
}
