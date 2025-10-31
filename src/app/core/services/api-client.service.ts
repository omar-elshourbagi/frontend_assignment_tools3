import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, params?: HttpParams | Record<string, string | number | boolean>): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.get<T>(url, { params: this.toHttpParams(params) });
  }

  post<T>(path: string, body: unknown, headers?: HttpHeaders | Record<string, string>): Observable<T> {
    const url = this.buildUrl(path);
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const mergedHeaders = headers ? { ...defaultHeaders, ...(headers instanceof HttpHeaders ? {} : headers) } : defaultHeaders;
    return this.http.post<T>(url, body, { headers: this.toHeaders(mergedHeaders) });
  }

  put<T>(path: string, body: unknown, headers?: HttpHeaders | Record<string, string>): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.put<T>(url, body, { headers: this.toHeaders(headers) });
  }

  delete<T>(path: string): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.delete<T>(url);
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  private toHttpParams(params?: HttpParams | Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) return undefined;
    if (params instanceof HttpParams) return params;
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      hp = hp.set(k, String(v));
    });
    return hp;
  }

  private toHeaders(headers?: HttpHeaders | Record<string, string>): HttpHeaders | undefined {
    if (!headers) return undefined;
    if (headers instanceof HttpHeaders) return headers;
    let h = new HttpHeaders();
    Object.entries(headers).forEach(([k, v]) => {
      h = h.set(k, v);
    });
    return h;
  }
}


