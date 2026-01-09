import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from './keycloak.service';
import { ApiResponse } from '@interface/api-response.interface';

interface ApiOptions {
  headers?: HttpHeaders;
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  responseType?: 'json' | 'blob';
  reportProgress?: boolean;
  withCredentials?: boolean;
  needFullResponse?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly keycloakService = inject(KeycloakService)
  private readonly baseUrl = environment.host;

  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
  }

  private initiatCall<T>(methodType: string, endpoint: string, body: unknown, options: ApiOptions = {}): Observable<T> {
    let finalOptions = {};
    let headers = options.headers || new HttpHeaders();
    if (options.withCredentials == undefined || options.withCredentials == null ) {
      const token = this.keycloakService.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    finalOptions = {
      ...options,
      headers,
      responseType: options.responseType == 'blob' ? 'blob' : 'json' as const,
    }
    return this.http.request<T>(methodType, this.buildUrl(endpoint), { body, ...finalOptions }).pipe(
      map((res: unknown) => {
        if (options.responseType === 'blob') {
          return res as T;
        }

        if (!options.needFullResponse && this.isApiResponse<T>(res)) {
          return res.data;
        }

        return res as T;
      })
    );
  }

  private isApiResponse<T>(res: unknown): res is ApiResponse<T> {
    return !!res
      && typeof res === 'object'
      && res !== null
      && 'data' in (res as Record<string, unknown>)
      && 'message' in (res as Record<string, unknown>)
      && 'status' in (res as Record<string, unknown>)
      && 'localizedKey' in (res as Record<string, unknown>);
  }

  get<T>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    return this.initiatCall('GET', endpoint, null, options);
  }

  post<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Observable<T> {
    return this.initiatCall('POST', endpoint, body, options);
  }

  put<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Observable<T> {
    return this.initiatCall('PUT', endpoint, body, options);
  }

  patch<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Observable<T> {
    return this.initiatCall('PATCH', endpoint, body, options);
  }

  delete<T>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    return this.initiatCall('DELETE', endpoint, null, options);
  }
}
