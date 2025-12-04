# Angular - 1.1 Handle API Exceptions Globally - POC

## Project Metadata
- Repository: https://github.com/neutral-00/poc-angular
- branch:  1-1-handle-api-exception-globally

## Learning Objective
1. [x] Handle API Exceptions Globally

## Pre-requisites
- Setup project as in https://github.com/neutral-00/poc-angular-old main branch

**INFO**
> The project is created with angular cli 21.x with the flag --standalone=false
> This is to support the old modular way to support older projects
> For the new approch tutorial will be added in https://github.com/neutral-00/poc-angular and branch: 1-1-handle-api-exception-globally

## Extra Library Added
We have
1. Bootstrap CSS

## Initial Project Structure
```
src
├── app
│   ├── app-module.ts
│   ├── app-routing-module.ts
│   ├── app.html
│   ├── app.scss
│   ├── app.spec.ts
│   └── app.ts
├── index.html
├── main.ts
└── styles.scss
```

## High Level Plan
1. run the command `ng g interceptor interceptor/api-error` to create `src/app/interceptor/api-error-interceptor.ts`
2. register the interceptor
3. create a service under `src/app/service/` that will make an api call to one of the api in https://jsonplaceholder.typicode.com/
4. create a component under `src/app/component` to demo api call. let it have two buttons
    - one will make a valid api called 
    - another will make an invalid api so that we can demo global api exception handling
    - use the service defined above

## Detailed Steps

1. **Generate Interceptor**: `ng g interceptor interceptor/api-error` creates `src/app/interceptor/api-error.interceptor.ts`.
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Global API Error:', error.status, error.message);
        alert(`API Error ${error.status}: ${error.message}`); // Demo UI feedback
        return throwError(() => error);
      })
    );
  }
}
```

2. **Register Interceptor** in `app.module.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiErrorInterceptor } from './interceptor/api-error.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true }
  ]
})
```

3. **Create Service** `ng g service service/api --skip-tests` → `src/app/service/api.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
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
```

4. **Create Component** `ng g component component/demo-api --skip-tests`:
```typescript
// demo-api.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-demo-api',
  template: `
    <div class="container mt-4">
      <h3>API Demo</h3>
      <button class="btn btn-success me-2" (click)="callValidApi()">Valid API</button>
      <button class="btn btn-danger" (click)="callInvalidApi()">Invalid API (Triggers Interceptor)</button>
      <pre>{{ response | json }}</pre>
    </div>
  `
})
export class DemoApiComponent {
  response: any;

  constructor(private apiService: ApiService) {}

  callValidApi() {
    this.apiService.getPosts().subscribe(data => this.response = data);
  }

  callInvalidApi() {
    this.apiService.getInvalid().subscribe({
      next: data => this.response = data,
      error: err => console.log('Handled by interceptor') // Won't reach here
    });
  }
}
```

5. **Update Routing** in `app-routing.module.ts`:
```typescript
{ path: 'demo', component: DemoApiComponent }
```

6. **Import HttpClientModule** in `app.module.ts`:

```typescript
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { ApiErrorInterceptor } from './interceptor/api-error-interceptor';
import { DemoApi } from './component/demo-api/demo-api';

@NgModule({
  declarations: [
    App,
    DemoApi
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
```


## Testing
- Navigate to `/demo`
- **Valid button**: Shows posts array
- **Invalid button**: Console shows 404, alert pops (interceptor), no crash

---

Let's look at a new way of doing what we have done.

## Converting Class Interceptor to HttpInterceptorFn

Your current class interceptor needs to be rewritten as a function like this:

```typescript
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

export const apiErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      alert(`API Error: ${error.status} : ${error.message}`);
      return throwError(() => error);
    })
  );
}
```

Then register it like:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiErrorInterceptor } from './interceptor/api-error.interceptor';  // function, not class

providers: [
  provideHttpClient(withInterceptors([apiErrorInterceptor]))
]
```

## Summary
- Legacy class-based interceptors require `HTTP_INTERCEPTORS` token and `@Injectable`.
- New Angular 21+ `provideHttpClient` uses functional-style `HttpInterceptorFn`.
- Convert your class interceptor logic into a function with the `(req, next) => Observable`

This aligns with Angular’s move to standalone APIs and better tree-shaking.