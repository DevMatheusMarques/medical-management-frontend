import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';  // Importação do HttpClientModule
import { Router } from '@angular/router';  // Importação do Router para redirecionamento
import { CommonModule } from '@angular/common';  // Importação do CommonModule
import { jwtDecode } from 'jwt-decode';
import {ToastService} from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,  // Adicionando HttpClientModule aos imports
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;
  rememberMe = false;
  private apiUrl = `${environment.apiUrl}/api/auth/login`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const savedUsername = localStorage.getItem('savedUsername') || '';

    this.loginForm = this.fb.group({
      username: [savedUsername, Validators.required],
      password: ['', Validators.required],
      rememberMe: [!!savedUsername]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password, rememberMe } = this.loginForm.value;

    // Salvar o nome de usuário no localStorage se "rememberMe" for verdadeiro
    if (rememberMe) {
      localStorage.setItem('savedUsername', username);
    } else {
      localStorage.removeItem('savedUsername');
    }

    // Criar o objeto de login para enviar na requisição
    const loginData = { username, password };

    // Chamar o método para fazer a requisição para o back-end
    this.loginToBackend(loginData);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loginToBackend(loginData: { username: string; password: string }): void {
    const requestData = {
      login: loginData.username,
      password: loginData.password
    };

    this.http.post<any>(this.apiUrl, requestData).subscribe(
      response => {
        const token = response.token;
        const refreshToken = response.refreshToken;

        const decodedToken: any = jwtDecode(token);
        const username = decodedToken.username;
        const role: any = decodedToken.role;

        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('authUsername', username);
        localStorage.setItem('authRole', role);

        this.toastService.showToast('Acesso realizado com sucesso!', 'success');

        this.router.navigate(['/dashboard']);
      },
      error => {
        this.toastService.showToast(error.error?.message, 'error');
        console.error('Erro ao fazer login:', error);
      }
    );
  }

  // Método para adicionar o token ao cabeçalho
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}
