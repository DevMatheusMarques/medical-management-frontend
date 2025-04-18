import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';



interface ReportOption {
  id: string;
  name: string;
  description: string;
  type: 'patient' | 'doctor' | 'consultation' | 'consultationBySpecialty';
  icon: string;
}

interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  status?: string | null;
  specialty?: string | null;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reportOptions: ReportOption[] = [
    {
      id: 'patients',
      name: 'Relatório de Pacientes',
      description: 'Lista de pacientes com status e última consulta',
      type: 'patient',
      icon: 'fas fa-users'
    },
    {
      id: 'doctors',
      name: 'Relatório de Médicos',
      description: 'Lista de médicos por especialidade',
      type: 'doctor',
      icon: 'fas fa-stethoscope'
    },
    {
      id: 'consultations',
      name: 'Relatório de Consultas',
      description: 'Histórico de consultas por período',
      type: 'consultation',
      icon: 'fas fa-calendar-check'
    },
    {
      id: 'patient-consultations',
      name: 'Consultas por Paciente',
      description: 'Número de consultas por paciente',
      type: 'patient',
      icon: 'fas fa-user-injured'
    },
    {
      id: 'doctor-consultations',
      name: 'Consultas por Médico',
      description: 'Número de consultas por médico',
      type: 'doctor',
      icon: 'fas fa-id-badge'
    },
    {
      id: 'specialty-consultations',
      name: 'Consultas por Especialidade',
      description: 'Número de consultas por especialidade',
      type: 'consultationBySpecialty',
      icon: 'fas fa-network-wired'
    }
  ];

  selectedReport: ReportOption | null = null;

  filters: ReportFilter = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  };

  reportData: any[] = [];
  reportColumns: any[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math;

  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  get pages(): number[] {
    const pageCount = Math.ceil(this.reportData.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  selectReport(report: ReportOption): void {
    this.selectedReport = report;
    this.reportData = [];
    this.setReportColumns(report.id);
  }

  setReportColumns(reportId: string): void {
    switch (reportId) {
      case 'patients':
        this.reportColumns = [
          { key: 'patientId', header: 'ID' },
          { key: 'patientName', header: 'Nome' },
          { key: 'patientEmail', header: 'Email' },
          { key: 'patientTelephone', header: 'Telefone' },
          { key: 'lastConsultation', header: 'Última Consulta', type: 'date' },
          { key: 'patientStatus', header: 'Status', type: 'status' }
        ];
        break;
      case 'doctors':
        this.reportColumns = [
          { key: 'doctorId', header: 'ID' },
          { key: 'doctorName', header: 'Nome' },
          { key: 'specialty', header: 'Especialidade' },
          { key: 'doctorEmail', header: 'Email' },
          { key: 'doctorTelephone', header: 'Telefone' },
        ];
        break;
      case 'consultations':
        this.reportColumns = [
          { key: 'consultationId', header: 'ID' },
          { key: 'patientName', header: 'Paciente' },
          { key: 'doctorName', header: 'Médico' },
          { key: 'doctorSpecialty', header: 'Especialidade' },
          { key: 'date', header: 'Data', type: 'date' },
          { key: 'status', header: 'Status', type: 'status' }
        ];
        break;
      case 'patient-consultations':
        this.reportColumns = [
          { key: 'patientId', header: 'ID' },
          { key: 'patientName', header: 'Paciente' },
          { key: 'consultationCount', header: 'Total de Consultas' },
          { key: 'lastConsultation', header: 'Última Consulta', type: 'date' }
        ];
        break;
      case 'doctor-consultations':
        this.reportColumns = [
          { key: 'doctorId', header: 'ID' },
          { key: 'doctorName', header: 'Médico' },
          { key: 'specialty', header: 'Especialidade' },
          { key: 'totalConsultations', header: 'Total de Consultas' }
        ];
        break;
      case 'specialty-consultations':
        this.reportColumns = [
          { key: 'specialty', header: 'Especialidade' },
          { key: 'consultationCount', header: 'Total de Consultas' },
          { key: 'doctorCount', header: 'Número de Médicos' }
        ];
        break;
    }
  }

  clearFilters(): void {
    this.filters = {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    };
  }

  generateReport(): void {
    if (!this.selectedReport) return;

    const reportId = this.selectedReport.id;
    const endpoint = this.getReportEndpoint(reportId);

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const filtersToSend: ReportFilter = {
      ...this.filters,
      status: this.filters.status?.trim() || null,
      specialty: this.filters.specialty?.trim() || null
    };

    this.http.post<any[]>(`${this.apiUrl}/${endpoint}`, filtersToSend, { headers }).subscribe({
      next: (data) => {
        this.reportData = data;
        this.currentPage = 1;
      },
      error: (error) => {
        console.error('Erro ao gerar relatório:', error);
      }
    });
  }

  getReportEndpoint(reportId: string): string {
    switch (reportId) {
      case 'patients': return 'patients';
      case 'doctors': return 'doctors';
      case 'consultations': return 'consultations';
      case 'patient-consultations': return 'patient-consultations';
      case 'doctor-consultations': return 'doctor-consultations';
      case 'specialty-consultations': return 'specialty-consultations';
      default: return '';
    }
  }

  exportCSV(): void {
    if (!this.reportData.length) return;

    const headers = this.reportColumns.map(col => col.header);

    const rows = this.reportData.map(item => {
      return this.reportColumns.map(col => {
        const value = this.getNestedValue(item, col.key);
        if (col.type === 'date') {
          return this.formatDate(value);
        }
        return value;
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.selectedReport?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportPDF(): void {
    if (!this.reportData.length || !this.selectedReport) return;

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(this.selectedReport.name, 14, 15);

    const columns = this.reportColumns.map(col => ({ header: col.header, dataKey: col.key }));
    const rows = this.reportData.map(item => {
      const row: any = {};
      this.reportColumns.forEach(col => {
        let value = this.getNestedValue(item, col.key);
        if (col.type === 'date') {
          value = this.formatDate(value);
        }
        row[col.key] = value ?? '';
      });
      return row;
    });

    autoTable(doc, {
      columns: columns,
      body: rows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [56, 181, 147] }
    });

    const fileName = `${this.selectedReport.name}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  printReport(): void {
    window.print();
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'ativo':
      case 'finalizada':
        return 'bg-green-100 text-green-800';
      case 'inativo':
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: dateString.toString().includes('T') ? '2-digit' : undefined,
      minute: dateString.toString().includes('T') ? '2-digit' : undefined
    });
  }

  countByStatus(status: string): number {
    if (!this.reportData) return 0;

    return this.reportData.filter(item => {
      if (this.selectedReport?.type === 'patient') {
        return item.patientStatus?.toLowerCase() === status.toLowerCase();
      }

      if (this.selectedReport?.type === 'consultation') {
        return item.status?.toLowerCase() === status.toLowerCase();
      }

      return false;
    }).length;
  }
}
