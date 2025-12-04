import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";

export class ApiErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        alert(`API Error: ${error.status} : ${error.message}`);
        return throwError(()=> error);
      })
    );
  }

}