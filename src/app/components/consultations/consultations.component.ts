import {Component, Input, ViewChild} from '@angular/core';
import {Column, DataTableComponent} from '../data-table/data-table.component';
import {DynamicModalComponent} from '../dynamic-modal/dynamic-modal.component';
import {MaskDirective} from '../../shared/directives/mask.directive';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {ToastService} from '../../shared/services/toast.service';
import Swal from 'sweetalert2';
import {forkJoin} from 'rxjs';
import {VerifyDataService} from '../../shared/services/verifyData.service';
import { environment } from '../../../environments/environment';
import {GenericDataService} from '../../shared/services/generic-data.service';
import {ActivatedRoute} from '@angular/router';

interface Consultation {
  id: number;
  patient: {
    id: number;
    name: string;
    telephone: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  date: string;
  time: string;
  status: string;
  observations: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  telephone: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  crm: string;
  telephone: string;
  status: string;
}

@Component({
  selector: 'app-consultations',
  imports: [
    DataTableComponent,
    HttpClientModule,
    DynamicModalComponent,
  ],
  templateUrl: './consultations.component.html',
  styleUrl: './consultations.component.css'
})
export class ConsultationsComponent {
  @Input() selectedTab: string = '';
  @ViewChild(MaskDirective) maskDirective!: MaskDirective;
  showModal = false;
  viewMode = false;
  modalTitle = '';
  modalFields: any[] = [];
  editingConsultationId = '';

  consultationsColumns: Column[] = [
    { key: 'patient.name', header: 'Paciente', type: 'text' },
    { key: 'doctor.name', header: 'Médico', type: 'text' },
    { key: 'date', header: 'Data da Consulta', type: 'text' },
    { key: 'time', header: 'Horário', type: 'text' },
    { key: 'status', header: 'Status', type: 'status' },
    { key: 'action', header: 'Ações', type: 'action' }
  ];

  consultationData: Consultation[] = [];

  doctorData: Doctor[] = [];
  patientData: Patient[] = [];

  private apiUrl = `${environment.apiUrl}/api/consultations`;

  constructor(private dataService: GenericDataService, private route: ActivatedRoute, private http: HttpClient, private toastService: ToastService, private verifyDataService: VerifyDataService) {}

  ngOnInit(): void {
    this.consultationData = this.route.snapshot.data['data'];
  }

  openModal() {
    this.selectedTab = 'Consultas';
    this.modalTitle = 'Adicionar Consulta';

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Chamar os dois endpoints ao mesmo tempo usando forkJoin
    forkJoin({
      doctors: this.http.get<Doctor[]>(`${environment.apiUrl}/api/doctors`, { headers }),
      patients: this.http.get<Patient[]>(`${environment.apiUrl}/api/patients`, { headers })
    }).subscribe(({ doctors, patients }) => {
      this.doctorData = doctors.sort((a, b) => a.name.localeCompare(b.name));
      this.patientData = patients.sort((a, b) => a.name.localeCompare(b.name));
      this.modalFields = [
        {
          label: 'Paciente',
          name: 'patient',
          type: 'select',
          value: '',
          placeholder: 'Selecione o paciente',
          options: this.patientData.map(patient => ({
            label: patient.name,
            value: patient.id
          }))
        },
        {
          label: 'Médico',
          name: 'doctor',
          type: 'select',
          value: '',
          placeholder: 'Selecione o médico',
          options: this.doctorData.map(doctor => ({
            label: doctor.name,
            value: doctor.id
          }))
        },
        { label: 'Data da Consulta', name: 'date', type: 'date', value: '' },
        { label: 'Horário da Consulta', name: 'time', type: 'time', value: '' },
      ];

      this.viewMode = false;
      this.showModal = true;
    });
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
    if (formData['date']) {
      const dateObj = new Date(formData['date'] + 'T12:00:00');
      formattedDate = dateObj.toLocaleDateString('pt-BR');
    }

    let dataToSend: any = {
      patient: { id: formData['patient'] },
      doctor: { id: formData['doctor'] },
      date: formattedDate,
      time: formData['time'],
      status: 'Pendente',
      observations: formData['observations'] || ''
    };


    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.apiUrl, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('consultations');
        this.dataService.get<any[]>('consultations').subscribe((data) => {
          this.consultationData = data;
        });
        this.toastService.showToast('Consulta cadastrada com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  editConsultation(consultation: any): void {
    this.selectedTab = 'Consultas';
    this.modalTitle = 'Editar Consulta';

    this.editingConsultationId = consultation.id;

    const formattedDate = consultation.date ? formatDateString(consultation.date) : '';

    function formatDateString(dateStr: string): string {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString().split('T')[0];
      }
      return new Date(dateStr).toISOString().split('T')[0];
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    forkJoin({
      doctors: this.http.get<Doctor[]>(`${environment.apiUrl}/api/doctors`, { headers }),
      patients: this.http.get<Patient[]>(`${environment.apiUrl}/api/patients`, { headers })
    }).subscribe(({ doctors, patients }) => {
      this.doctorData = doctors.sort((a, b) => a.name.localeCompare(b.name));
      this.patientData = patients.sort((a, b) => a.name.localeCompare(b.name));
      this.modalFields = [
        {
          label: 'Paciente',
          name: 'patient',
          type: 'select',
          value: consultation.patient.id,
          placeholder: 'Selecione o paciente',
          options: this.patientData.map(patient => ({
            label: patient.name,
            value: patient.id
          }))
        },
        {
          label: 'Médico',
          name: 'doctor',
          type: 'select',
          value: consultation.doctor.id,
          placeholder: 'Selecione o médico',
          options: this.doctorData.map(doctor => ({
            label: doctor.name,
            value: doctor.id
          }))
        },
        { label: 'Data da Consulta', name: 'date', type: 'date', value: formattedDate },
        { label: 'Horário da Consulta', name: 'time', type: 'time', value: consultation.time },
        {
          label: 'Status',
          name: 'status',
          type: 'radio',
          value: consultation.status,
          options: [
            { label: 'Pendente', value: 'Pendente' },
            { label: 'Finalizada', value: 'Finalizada' },
            { label: 'Cancelada', value: 'Cancelada' }
          ]
        },
      ];

      this.viewMode = false;
      this.showModal = true;
    });
  }


  handleSubmitEdit() {
    if (!this.verifyDataService.verifyData(this.modalFields, this.selectedTab)) return;

    const formData: any = {};
    this.modalFields.forEach(field => {
      formData[field.name] = field.value;
    });

    let formattedDate = '';
    if (formData['date']) {
      const dateObj = new Date(formData['date'] + 'T12:00:00');
      formattedDate = dateObj.toLocaleDateString('pt-BR');
    }

    let dataToSend: any = {
      patient: { id: formData['patient'] },
      doctor: { id: formData['doctor'] },
      date: formattedDate,
      time: formData['time'],
      status: formData['status'],
      observations: formData['observations'] || ''
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = `${this.apiUrl}/${this.editingConsultationId}`;
    this.http.put(endpoint, dataToSend, { headers }).subscribe(
      response => {
        this.closeModal();
        this.dataService.clear('consultations');
        this.dataService.get<any[]>('consultations').subscribe((data) => {
          this.consultationData = data;
        });
        this.toastService.showToast('Consulta atualizada com sucesso!', 'success');
      },
      error => {
        const errorMessage = error.error?.message || 'Erro desconhecido';
        this.toastService.showToast(errorMessage, 'error');
      }
    );
  }

  deleteConsultation(consultation: any): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded cursor-pointer",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded me-4 cursor-pointer",
        actions: "flex justify-center"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Tem certeza que deseja excluir esta consulta?",
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

        const endpoint = `${this.apiUrl}/${consultation.id}`;
        this.http.delete(endpoint, { headers }).subscribe(
          response => {
            this.dataService.clear('consultations');
            this.dataService.get<any[]>('consultations').subscribe((data) => {
              this.consultationData = data;
            });
            this.toastService.showToast('Consulta excluída com sucesso!', 'success');
          },
          error => {
            const errorMessage = error.error?.message || 'Erro desconhecido';
            this.toastService.showToast(errorMessage, 'error');
          }
        );
      }
    });
  }

  sendMessage(item: any) {
    let phoneNumber = item.patient.telephone;

    const patientName = item.patient.name;

    const consultationDate = item.date;
    const consultationTime = item.time;

    phoneNumber = phoneNumber.replace(/\D/g, '');

    if (!phoneNumber.startsWith('55')) {
      phoneNumber = '55' + phoneNumber;
    }

    const message = `Olá, ${patientName}! Estamos entrando em contato para falar sobre sua consulta agendada para o dia ${consultationDate} as ${consultationTime}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }
}
