import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserServiceService } from '../user-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) {}


  

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let jwt = localStorage.getItem('jwt');
    if (jwt) {

        const headers = new HttpHeaders({
            Authorization: `Bearer ${jwt}`
          });
          
        const response = await this.http.get<{ role: string }>('http://localhost:3000/api/users/jwt/jwt/jwt', {headers}).toPromise();
        if(response && response.role=='admin'){
          
            if(route.routeConfig?.path == 'AdminPanel' || route.routeConfig?.path == 'NewAdmin'){
              return true;
            }
            else{
              return false;
            }
        }
        else{
          if(response && response.role=='customer'){
            if(route.routeConfig?.path == 'Main' || route.routeConfig?.path == 'Ride-history'){
              return true;
            }
            else{
              return false;
            }
          }
          else{
            this.router.navigate(['/Login']);
            return false;
          }
        }
        
    }
    else{
        // User doesn't have a JWT, redirect to login page
        this.router.navigate(['/Login']);
        return false;
    }
  }


}
