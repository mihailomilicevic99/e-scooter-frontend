import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';
import { User } from './app/models/User';
import { LoginResponse} from './app/models/LoginResponse';
import { Scooter } from './app/models/Scooter';
import { Ride } from './app/models/Ride';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor(private http: HttpClient) { }


  //-------------------------------------------------USERS-------------------------------------------
  login(username: string, password: string):Observable<LoginResponse>{
    return this.http.get<LoginResponse>('http://localhost:3000/api/users/' + username + '/' + password);  
  }

  insertUser(user:any){
    return this.http.post('http://localhost:3000/api/users', user);
  }


  checkIfEmailExists(email: string):Observable<boolean>{
    return this.http.get<boolean>('http://localhost:3000/api/users/' + email);  
  }

  updateUser(user: User):Observable<User>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<User>('http://localhost:3000/api/users/' + user.username , user , {headers});
  }


  getAllUsers():Observable<User[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<User[]>('http://localhost:3000/api/users/', {headers});
  }


  deleteUser(user:User){
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.delete('http://localhost:3000/api/users/' + user.username , {headers})
  }

  //---------------------------------------------END USERS-------------------------------------------


  //--------------------------------------------- SCOOTERS-------------------------------------------

  getAllScooters():Observable<Scooter[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Scooter[]>('http://localhost:3000/api/scooters', {headers});  
  }


  getScooter(id:number):Observable<Scooter[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Scooter[]>('http://localhost:3000/api/scooters/' + id, {headers});
  }


  reserveScooter(id: number, user:User, res_time:Date):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    let reservation_obj = {
      user: user,
      res_time: res_time
    }
    return this.http.put<Scooter>('http://localhost:3000/api/scooters/reservation/' + id, reservation_obj , {headers});
  }


  releaseScooter(id: number, user:User):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<Scooter>('http://localhost:3000/api/scooters/release/' + id, user ,{headers});
  }


  updateScooter(scooter: Scooter):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<Scooter>('http://localhost:3000/api/scooters/' + scooter.id, scooter, {headers});
  }


  deleteScooter(scooter:Scooter){
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.delete('http://localhost:3000/api/scooters/' + scooter.id, {headers})
  }


  insertScooter(scooter:Scooter):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.post<Scooter>('http://localhost:3000/api/scooters', scooter, {headers});
  }


  //-------------------------------------------END SCOOTERS-------------------------------------------



  //------------------------------------------------RIDES---------------------------------------------

  insertRide(ride: Ride):Observable<Ride>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.post<Ride>('http://localhost:3000/api/rides', ride, {headers});
  }


  getAllRides():Observable<Ride[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Ride[]>('http://localhost:3000/api/rides', {headers});
  }


  getRidesByUser(username: string):Observable<Ride[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Ride[]>('http://localhost:3000/api/rides/' + username, {headers});
  }

  //----------------------------------------------END RIDES-------------------------------------------
}
