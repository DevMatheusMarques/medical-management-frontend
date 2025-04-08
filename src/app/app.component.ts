import { Component } from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import { CommonModule } from '@angular/common';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {ToastContainerComponent} from './components/toast-container/toast-container.component';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {NgChartsModule} from 'ng2-charts';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterModule,
    SidebarComponent,
    ToastContainerComponent,
    SweetAlert2Module,
    NgChartsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'medical-management-frontend';

  isCollapsed = false;
  isLoginPage: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url === '/';
    });
  }

  toggleSidebar(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}
