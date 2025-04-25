import { Routes } from '@angular/router';
import {AuthComponent} from './components/auth/auth.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {PatientsComponent} from './components/patients/patients.component';
import {DoctorsComponent} from './components/doctors/doctors.component';
import {ConsultationsComponent} from './components/consultations/consultations.component';
import {UsersComponent} from './components/users/users.component';
import {ReportsComponent} from './components/reports/reports.component';
import {SpecialtiesComponent} from './components/specialties/specialties.component';
import {GenericDataResolver} from './shared/services/generic-data.resolver';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent, resolve: { data: GenericDataResolver }, data: { endpoint: 'patients' } },
  { path: 'doctors', component: DoctorsComponent, resolve: { data: GenericDataResolver }, data: { endpoint: 'doctors' }},
  { path: 'consultations', component: ConsultationsComponent, resolve: { data: GenericDataResolver }, data: { endpoint: 'consultations' } },
  { path: 'users', component: UsersComponent, resolve: { data: GenericDataResolver }, data: { endpoint: 'users' } },
  { path: 'reports', component: ReportsComponent },
  { path: 'specialties', component: SpecialtiesComponent, resolve: { data: GenericDataResolver }, data: { endpoint: 'specialties' }},
  { path: '**', redirectTo: '' }
];
