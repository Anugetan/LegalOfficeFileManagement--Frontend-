import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  console.log('AUTH INTERCEPTOR');
  console.log('Token exists:', !!token);

  if (token) {

    console.log('Adding Authorization header');

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  } else {

    console.warn('NO JWT TOKEN FOUND');

  }

  return next(req);
};