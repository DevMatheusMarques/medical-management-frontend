import {Injectable, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class VerifyDataService {

  constructor(private toastService: ToastService) {}

  verifyData(modalFields: { type: string, value: any, name: string }[], selectedTab: string): boolean {
    const shouldIgnoreField = (fieldName: string): boolean =>
      fieldName === 'complement' || fieldName === 'password';

    const isFieldValid = (field: { type: string; value: any; name: string }): boolean => {
      if (shouldIgnoreField(field.name)) return true;

      if (field.type === 'select') {
        return field.value !== null && field.value !== undefined && field.value !== '';
      }

      if (field.type === 'date' || field.type === 'time') {
        return typeof field.value === 'string' && field.value.trim() !== '';
      }

      if (typeof field.value === 'string') {
        return field.value.trim() !== '';
      }

      return !!field.value;
    };

    const tabsWithValidation = ['Consultas', 'Médicos', 'Pacientes', 'Usuários'];
    const requiresValidation = tabsWithValidation.includes(selectedTab);

    if (requiresValidation) {
      const allFieldsFilled = modalFields.every(isFieldValid);

      if (!allFieldsFilled) {
        this.toastService.showToast('Todos os campos precisam estar preenchidos!', 'error');
        return false;
      }
    }

    return true;
  }
}
