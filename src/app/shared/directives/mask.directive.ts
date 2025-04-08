import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMask]'
})
export class MaskDirective {
  @Input() appMask: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let value = inputElement.value;
    let formattedValue = value;

    if (this.appMask === 'cpf') {
      formattedValue = this.applyCpfMask(value);
    } else if (this.appMask === 'telephone') {
      formattedValue = this.applyPhoneMask(value);
    } else if (this.appMask === 'crm') {
      formattedValue = this.applyCrmMask(value);
    }

    if (inputElement.value !== formattedValue) {
      inputElement.value = formattedValue;
      inputElement.dispatchEvent(new Event('input'));
    }
  }

  private applyCpfMask(value: string): string {
    if (!value) return '';

    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }

  private applyPhoneMask(value: string): string {
    if (!value) return '';

    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    return value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
  }

  private applyCrmMask(value: string): string {
    if (!value) return '';

    value = value.replace(/[^0-9A-Za-z]/g, '');

    let numbers = value.replace(/\D/g, '');
    let letters = value.replace(/[^A-Za-z]/g, '').toUpperCase();

    if (numbers.length > 6) {
      numbers = numbers.substring(0, 6);
    }

    if (numbers.length <= 5) {
      value = numbers.replace(/(\d{2})(\d{3})/, '$1.$2');
    } else {
      value = numbers.replace(/(\d{3})(\d{3})/, '$1.$2');
    }

    if (letters.length > 0) {
      value += `-${letters.substring(0, 2)}`;
    }

    return value;
  }

}
