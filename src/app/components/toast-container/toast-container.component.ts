import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService } from '../../shared/services/toast.service';
import { Subscription } from 'rxjs';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  imports: [
    NgClass,
    NgForOf
  ],
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent implements OnInit, OnDestroy {

  toasts: { message: string, type: string }[] = [];
  toastSubscription!: Subscription;


  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.toastSubscription = this.toastService.toast$.subscribe(toast => {
      if (toast.message) {
        this.toasts.push({ message: toast.message, type: toast.type });

        // Remove o toast depois de 3 segundos
        setTimeout(() => {
          this.toasts.shift();
        }, toast.duration);
      }
    });
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }
}
