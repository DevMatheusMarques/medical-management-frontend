import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaskDirective } from '../../shared/directives/mask.directive';

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
  @Input() isViewMode: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() submitEdit = new EventEmitter<void>();
  @Output() onSearchInput = new EventEmitter<void>();
  showPassword: boolean = false;

  closeModal() {
    this.close.emit();
  }

  onSaveClick() {
    const isAdding = ['Adicionar Paciente', 'Adicionar Médico', 'Adicionar Consulta', 'Adicionar Usuário'].includes(this.title);

    isAdding ? this.submit.emit() : this.submitEdit.emit();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
