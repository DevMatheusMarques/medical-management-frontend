import { Routes } from '@angular/router';
import {AuthComponent} from './components/auth/auth.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {PatientsComponent} from './components/patients/patients.component';
import {DoctorsComponent} from './components/doctors/doctors.component';
import {ConsultationsComponent} from './components/consultations/consultations.component';
import {UsersComponent} from './components/users/users.component';
import {ReportsComponent} from './components/reports/reports.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'consultations', component: ConsultationsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' }
];
