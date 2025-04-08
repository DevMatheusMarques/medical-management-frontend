import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Chart from 'chart.js/auto';

interface DashboardData {
  patients: number[];
  doctors: number[];
  consultations: number[];
  months: string[];
  specialities: {
    name: string;
    count: number;
  }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData = {
    patients: [],
    doctors: [],
    consultations: [],
    months: [],
    specialities: []
  };

  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  getTotalFromArray(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }

  getGrowthRate(arr: number[]): number {
    if (arr.length < 2) return 0;
    const lastMonth = arr[arr.length - 1];
    const previousMonth = arr[arr.length - 2];
    return previousMonth === 0 ? 0 : Math.round((lastMonth - previousMonth) / previousMonth * 100);
  }

  getDashboardData(): Observable<DashboardData> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<DashboardData>(this.apiUrl, { headers });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.createCharts();
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
        this.mockDashboardData();
        this.createCharts();
      }
    });
  }

  mockDashboardData(): void {
    this.dashboardData = {
      patients: [120, 150, 180, 210, 250, 280],
      doctors: [45, 48, 50, 52, 55, 58],
      consultations: [350, 400, 450, 500, 550, 600],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      specialities: [
        { name: 'Cardiologia', count: 150 },
        { name: 'Pediatria', count: 120 },
        { name: 'Ortopedia', count: 100 },
        { name: 'Dermatologia', count: 80 },
        { name: 'Neurologia', count: 70 },
        { name: 'Outras', count: 180 }
      ]
    };
  }

  createCharts(): void {
    this.createMonthlyGrowthChart();
    this.createSpecialtiesChart();
    this.createConsultationsChart();
    this.createDistributionChart();
  }

  createMonthlyGrowthChart(): void {
    const ctx = document.getElementById('monthlyGrowthChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.dashboardData.months,
        datasets: [
          {
            label: 'Pacientes',
            data: this.dashboardData.patients,
            backgroundColor: '#38B593',
            hoverBackgroundColor: '#237E68'

          },
          {
            label: 'Médicos',
            data: this.dashboardData.doctors,
            backgroundColor: '#A8E5D1',
            hoverBackgroundColor: '#237E68'

          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createSpecialtiesChart(): void {
    const ctx = document.getElementById('specialtiesChart') as HTMLCanvasElement;

    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.dashboardData.specialities.map(s => s.name),
          datasets: [{
            label: 'Número de Consultas',
            data: this.dashboardData.specialities.map(s => s.count),
            backgroundColor: [
              '#155F4C', // Verde bem escuro, quase esmeralda
              '#1B5E20', // Verde bem escuro, quase militar
              '#2E7D32', // Verde mais escuro, para contraste
              '#237E68', // Verde Escuro Profundo
              '#2FA786', // Um tom um pouco mais escuro
              '#38B5A5', // Verde Menta com um leve tom azulado
              '#6B8F71', // Um verde acinzentado
              '#38B593', // Verde Menta (Base)
              '#6FD7B2', // Verde Menta Suave
              '#A8E5D1', // Verde Menta Claro (Highlight)
              '#A8E6CF', // Verde bem claro, quase pastel
              '#7BD389', // Um tom um pouco mais claro que o menta
              '#4CAF50', // Um verde mais forte e cheio
            ], hoverBackgroundColor: '#237E68'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  createConsultationsChart(): void {
    const ctx = document.getElementById('consultationsChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.dashboardData.months,
        datasets: [{
          label: 'Consultas',
          data: this.dashboardData.consultations,
          backgroundColor: '#38B593',
          hoverBackgroundColor: '#237E68',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createDistributionChart(): void {
    const ctx = document.getElementById('distributionChart') as HTMLCanvasElement;
    if (!ctx) return;

    const total = this.getTotalFromArray(this.dashboardData.consultations);
    const doctorsTotal = this.getTotalFromArray(this.dashboardData.doctors);
    const patientsTotal = this.getTotalFromArray(this.dashboardData.patients);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Consultas', 'Médicos', 'Pacientes'],
        datasets: [
          {
            label: 'Consultas',
            data: [total, 0, 0],
            backgroundColor: '#38B593',
            hoverBackgroundColor: '#237E68'
          },
          {
            label: 'Médicos',
            data: [0, doctorsTotal, 0],
            backgroundColor: '#6FD7B2',
            hoverBackgroundColor: '#237E68'
          },
          {
            label: 'Pacientes',
            data: [0, 0, patientsTotal],
            backgroundColor: '#A8E5D1',
            hoverBackgroundColor: '#237E68'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

}
