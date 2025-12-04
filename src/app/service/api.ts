import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
   private baseUrl = 'https://jsonplaceholder.typicode.com';

   constructor(private http: HttpClient) {}

   getPosts(): Observable<any[]> { // Valid: /posts [web:42]
    return this.http.get<any[]>(`${this.baseUrl}/posts`);
  }

  getInvalid(): Observable<any> { // Invalid endpoint
    return this.http.get<any>(`${this.baseUrl}/invalid-endpoint`);
  }

}
