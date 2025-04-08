import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface Toast {
  message: string;
  type: 'success' | 'error';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  constructor() { }

  // Método para exibir o toast
  showToast(message: string, type: 'success' | 'error', duration: number = 4000) {
    this.toastSubject.next({ message, type, duration });

    // Fechar o toast automaticamente após a duração
    setTimeout(() => {
      this.hideToast();
    }, duration);
  }

  // Método para ocultar o toast
  private hideToast() {
    this.toastSubject.next({ message: '', type: 'success', duration: 0 });
  }
}
