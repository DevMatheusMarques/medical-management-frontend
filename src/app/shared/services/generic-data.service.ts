import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GenericDataService {
  private cache = new Map<string, { data: any; loaded: boolean }>();

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    if (this.cache.has(endpoint) && this.cache.get(endpoint)!.loaded) {
      return of(this.cache.get(endpoint)!.data as T);
    }

    return this.http.get<T>(`${environment.apiUrl}/api/${endpoint}`, { headers }).pipe(
      tap((data: T) => {
        this.cache.set(endpoint, { data, loaded: true });
      })
    );
  }

  clear(endpoint: string): void {
    this.cache.delete(endpoint);
  }
}
