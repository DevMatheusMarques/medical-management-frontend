import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaskDirective } from '../../shared/directives/mask.directive';
import {ToastService} from '../../shared/services/toast.service';

@Component({
  selector: 'app-dynamic-modal',
  templateUrl: './dynamic-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MaskDirective]
})
export class DynamicModalComponent {
  @Input() title: string = '';
  @Input() fields: any[] = [];
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  formData: any = {};

  constructor(private toastService: ToastService) { }

  closeModal() {
    this.close.emit();
  }

  saveData() {
    const allFieldsFilled = this.fields.every(field => field.value && field.value !== '');

    if (!allFieldsFilled) {
      this.toastService.showToast('Todos os campos precisam estar preenchidos!', 'error');
      return;
    }

    this.submit.emit(this.formData);
    console.log('Dados saveData: ', this.formData);
    this.closeModal();
    this.toastService.showToast('Paciente cadastrado com sucesso!', 'success');
  }
}
