import {Injectable, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class VerifyDataService {

  constructor(private toastService: ToastService) {}

  verifyData(modalFields: { type: string, value: any, name: string }[], selectedTab: string) {
    if (selectedTab === "Consultas") {
      const allFieldsFilled = modalFields.every(field => {
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
      });

      if (!allFieldsFilled) {
        this.toastService.showToast('Todos os campos precisam estar preenchidos!', 'error');
        return false;
      }

      return true;
    } else {
      const allFieldsFilled = modalFields.every(field => {
        if (field.name === 'password') {
          return true;
        }
        return field.value && field.value.trim() !== '';
      });

      if (!allFieldsFilled) {
        this.toastService.showToast('Todos os campos precisam estar preenchidos!', 'error');
        return false;
      }

      return true;
    }
  }

}
