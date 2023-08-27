import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';
import { User } from './models/User';
import { LoginResponse} from './models/LoginResponse';
import { Scooter } from './models/Scooter';
import { Ride } from './models/Ride';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor(private http: HttpClient) { }


  //-------------------------------------------------USERS-------------------------------------------
  login(username: string, password: string):Observable<LoginResponse>{
    return this.http.get<LoginResponse>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/users/' + username + '/' + password);  
  }

  insertUser(user:any){
    return this.http.post('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/users', user);
  }


  checkIfEmailExists(email: string):Observable<boolean>{
    return this.http.get<boolean>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/users/' + email);  
  }

  updateUser(user: User):Observable<User>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<User>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/users/' + user.username , user , {headers});
  }


  getAllUsers():Observable<User[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<User[]>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/users/', {headers});
  }


  deleteUser(user:User){
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.delete('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/users/' + user.username , {headers})
  }

  //---------------------------------------------END USERS-------------------------------------------


  //--------------------------------------------- SCOOTERS-------------------------------------------

  getAllScooters():Observable<Scooter[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Scooter[]>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters', {headers});  
  }


  getScooter(id:number):Observable<Scooter[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Scooter[]>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/' + id, {headers});
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
    return this.http.put<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/reservation/' + id, reservation_obj , {headers});
  }


  releaseScooter(id: number, user:User):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/release/' + id, user ,{headers});
  }


  updateScooter(scooter: Scooter):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/' + scooter.id, scooter, {headers});
  }


  deleteScooter(scooter:Scooter){
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.delete('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/' + scooter.id, {headers})
  }


  insertScooter(scooter:Scooter):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.post<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters', scooter, {headers});
  }


  getToken(id:number):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/token/' + id, {headers});
  }


  deleteToken(id:number):Observable<Scooter>{
    console.log("deleting token")
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/token/' + id, {token: ""}, {headers});
  }


  insertToken(id:number, token:string):Observable<Scooter>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.put<Scooter>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/scooters/token/' + id, {token: token}, {headers});
  }


  //-------------------------------------------END SCOOTERS-------------------------------------------



  //------------------------------------------------RIDES---------------------------------------------

  insertRide(ride: Ride):Observable<Ride>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.post<Ride>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/rides', ride, {headers});
  }


  getAllRides():Observable<Ride[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Ride[]>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/rides', {headers});
  }


  getRidesByUser(username: string):Observable<Ride[]>{
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.get<Ride[]>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/rides/' + username, {headers});
  }

  //----------------------------------------------END RIDES-------------------------------------------



  
  //----------------------------------------------IMAGES-------------------------------------------

  getImage(id: number):Observable<Blob>{
    return this.http.get<Blob>('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/images/' + id); 
  }


  insertImage(formDataImage: any, id: number){
    const jwt = localStorage.getItem('jwt');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });
    return this.http.post('https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/images/' + id, formDataImage, {headers});
  }
  
  //----------------------------------------------END IMAGES-------------------------------------------
}
