import {Component, EventEmitter, Output} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {debounceTime, Observable, Subject, switchMap} from 'rxjs';
import {ToastService} from '../../shared/services/toast.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    NgClass,
    RouterLinkActive,
    NgForOf,
    NgIf,
    NgOptimizedImage,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = false;
  isDark = false;
  username: string = '';
  role: string = '';
  menuItems: { label: string; route: string; icon: string }[] = [];

  constructor(private router: Router, private http: HttpClient, private toastService: ToastService) {
    this.searchSubject.pipe(
      debounceTime(800),  // Espera 800ms após o último evento
      switchMap(term => this.askAIQuestion(term))  // Faz a requisição com o termo filtrado
    ).subscribe(
      response => {
        this.aiAnswer = response.answer;
        this.filteredFaqItems = [];
      },
      error => {
        this.aiAnswer = 'Houve um erro ao tentar buscar a resposta. Por favor, tente novamente.';
        this.toastService.showToast("Houve um erro ao tentar buscar a resposta. Por favor, tente novamente.", 'error');
        setTimeout(() => {
          this.aiAnswer = '';
        }, 5000);
      }
    );
  }

  @Output() collapsedChange = new EventEmitter<boolean>();

  faqItems: { question: string; answer: string }[] = [
    { question: 'Como cancelar uma consulta?', answer: 'Vá até a aba Consultas, clique no botão de editar da consulta desejada e depois altere o status para cancelada.' },
    { question: 'Horário de atendimento?', answer: 'Nosso horário é das 8h às 18h, de segunda a sexta.' },
    { question: 'Como editar perfil?', answer: 'Clique na sua foto no canto superior e selecione "Editar Perfil".' },
    { question: 'Posso reagendar uma consulta?', answer: 'Sim, basta acessar a consulta desejada, clicar no botão de editar e efetuar a alteração da data e horário da consulta.' },
  ];


  searchTerm: string = '';
  filteredFaqItems: { question: string; answer: string }[] = [];
  aiAnswer: string | null = null;

  private apiUrl = 'http://localhost:8080/api/faq/ask';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.username = localStorage.getItem('authUsername') || 'Usuário';
    this.role = localStorage.getItem('authRole') || 'Usuário';

    this.menuItems = [
      { label: 'Dashboard', route: '/dashboard', icon: 'home' },
      { label: 'Consultas', route: '/consultations', icon: 'calendar' },
      { label: 'Pacientes', route: '/patients', icon: 'patient' },
      { label: 'Médicos', route: '/doctors', icon: 'stethoscope' },
    ];

    if (this.role === 'Administrador') {
      this.menuItems.push(
        { label: 'Usuários', route: '/users', icon: 'users' },
        { label: 'Relatórios', route: '/progress', icon: 'chart' },
      );
    }

    this.menuItems.push({ label: 'Configurações', route: '/settings', icon: 'cog' },);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  getIconPath(icon: string): string {
    const paths: { [key: string]: string } = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      patient: 'M12 11c2.21 0 4-1.79 4-4S14.21 3 12 3 8 4.79 8 7s1.79 4 4 4zm0 2c-3.33 0-6 2.67-6 6h12c0-3.33-2.67-6-6-6z',
      stethoscope: 'M9 10a5 5 0 01-5-5V4m10 0v1a5 5 0 01-5 5m0 0v3a3 3 0 006 0v-3',
      users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };
    return paths[icon] || '';
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  getInitials(name: string): string {
    if (!name) return '';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    } else {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }

  logout(): void {
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authRole');
    this.router.navigate(['']);
  }

  askAIQuestion(question: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.apiUrl, { question }, { headers });
  }

  filterFAQ() {
    const term = this.searchTerm.toLowerCase();
    this.filteredFaqItems = this.faqItems.filter(item =>
      item.question.toLowerCase().includes(term)
    );

    // Se não encontrar na FAQ, consulta a IA
    if (this.filteredFaqItems.length === 0) {
      this.searchSubject.next(this.searchTerm);  // Envia o termo para o Subject, disparando a busca com IA
    }
  }
}
