import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ensure all requests use HTTPS
    if (request.url.startsWith('http://') && !request.url.startsWith('http://localhost')) {
      console.warn(`⚠️ WARNING: Non-HTTPS request detected: ${request.url}`);
      // In production, you could throw an error here to prevent insecure requests
      // throw new Error('All requests must use HTTPS');
    }

    // Add security headers to requests
    const secureRequest = request.clone({
      setHeaders: {
        // Prevent CSRF attacks
        'X-Requested-With': 'XMLHttpRequest',
        // Indicate this is an API request
        'X-API-Request': 'true'
      },
      // Include credentials (cookies) with requests if needed
      withCredentials: false
    });

    return next.handle(secureRequest).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Verify response headers for security
          // These should be set by your backend
          const cspHeader = event.headers.get('Content-Security-Policy');
          const xframeHeader = event.headers.get('X-Frame-Options');
          const xxssHeader = event.headers.get('X-XSS-Protection');
          
          if (!cspHeader) {
            console.warn('⚠️ WARNING: Content-Security-Policy header not set');
          }
          if (!xframeHeader) {
            console.warn('⚠️ WARNING: X-Frame-Options header not set');
          }
        }
      })
    );
  }
}
