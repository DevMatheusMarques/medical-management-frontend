import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMask]'
})
export class MaskDirective {
  @Input() appMask: string = ''; // Este input pode ser usado para passar a máscara de forma dinâmica

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let value = inputElement.value;

    if (this.appMask === 'cpf') {
      value = this.applyCpfMask(value);
    } else if (this.appMask === 'phone') {
      value = this.applyPhoneMask(value);
    }

    inputElement.value = value;
  }

  private applyCpfMask(value: string): string {
    // Verifique se o valor não é undefined ou null
    if (!value) {
      return '';
    }

    // Remove tudo o que não for número
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      // Aplica a máscara de CPF
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
    return value;
  }

  private applyPhoneMask(value: string): string {
    // Remove tudo o que não for número
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      // Aplica a máscara de telefone
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }
}
