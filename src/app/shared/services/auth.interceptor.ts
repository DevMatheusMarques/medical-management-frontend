import { inject, Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpClient
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private http = inject(HttpClient);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipAuthUrls = [
      'http://localhost:8080/api/auth/login',
      'http://localhost:8080/api/auth/refresh'
    ];

    if (skipAuthUrls.some(url => req.url.includes(url))) {
      return next.handle(req);
    }

    const authToken = localStorage.getItem('authToken');
    let authReq = req;

    if (authToken) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && error.error?.message === 'Token expirado') {
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            return this.http.post<any>('http://localhost:8080/api/auth/refresh', { refreshToken }).pipe(
              switchMap(newTokens => {
                localStorage.setItem('authToken', newTokens.token);
                localStorage.setItem('refreshToken', newTokens.refreshToken);

                const clonedReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newTokens.token}`
                  }
                });
                return next.handle(clonedReq);
              }),
              catchError(() => {
                this.router.navigate(['/login']);
                return throwError(() => new Error('Sessão expirada.'));
              })
            );
          } else {
            this.router.navigate(['/login']);
            return throwError(() => new Error('Token inválido.'));
          }
        }

        return throwError(() => error);
      })
    );
  }
}
