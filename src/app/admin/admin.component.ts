import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from 'src/user-service.service';
import { User } from '../models/User';
import { Scooter } from '../models/Scooter';
import { Ride } from '../models/Ride';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private service: UserServiceService) { }


  all_users:User[] = [];
  all_scooters: Scooter[] = [];
  all_rides:Ride[] = [];
  loged_in_user:User = {
    name_and_surname : "",
    username : "",
    password : "",
    role    : "",
    balance: 0,
    verified: false,
    isDriving: false,
    number_of_rides: -1,
    total_time: -1 ,
    reserved_scooter: -1,
    driving_started_timestamp: null,
    driving_scooter: -1
  };
  menu_active:boolean = false;

  loading_users:boolean = true;
  loading_scooters: boolean = true;
  loading_rides:boolean = true;
  current_mode: string = "map";


  ngOnInit(): void {

    var user = localStorage.getItem("LogedInUser");
    if(user != null){
      this.loged_in_user = JSON.parse(user);
    }
    else{
      this.logout();
    }

    //--------check if session has expired---------
    const logoutTime = localStorage.getItem('logoutTime');
    if (logoutTime) {
      const now = new Date().getTime();
      if (now > +logoutTime) {
        this.logout();
      } else {
        setTimeout(() => this.logout(), +logoutTime - now);
      }
    }
    
    //--------End check if session has expired---------

    //-----------------Set current mode to map--------------
    this.current_mode = "map";
    const button = document.getElementById(`button${1}`);
    if(button){
      button.classList.add('active');
    }
    //---------------End set current mode to map--------------


    //Load data from database
    this.service.getAllUsers().subscribe(res=>{
      this.all_users = res;
      this.all_users.forEach(user=>{
        user.balance = Number(user.balance.toFixed(2));
        user.total_time = Number(user.total_time.toFixed(2));
      });
      this.loading_users = false;

      this.service.getAllScooters().subscribe(res=>{
        this.all_scooters = res;
        this.all_scooters.forEach(scooter=>{
          scooter.total_time = Number(scooter.total_time.toFixed(2));
          this.loading_scooters = false;

          this.service.getAllRides().subscribe(res=>{
            this.all_rides = res;
            this.all_rides.forEach(ride=>{
              ride.duration = Number(ride.duration.toFixed(2));
              ride.price = Number(ride.price.toFixed(2));
              this.loading_rides = false;
            })

            //--------------------------------Reset session timer------------------------- 
            const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
            localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
            //------------------------------End reset session timer------------------------
          })
        })
      })
    });
  }


  ngOnDestroy(): void {
    
  }


  toggleMode(buttonId: any, mode: string) {
    const button = document.getElementById(`button${buttonId}`);

    // Remove 'active' class from inactive button
    if(buttonId==1){
      let inactive_button = document.getElementById(`button${2}`);
      if(inactive_button!=null){
        inactive_button.classList.remove('active');
      }
    }
    else{
      let inactive_button = document.getElementById(`button${1}`);
      if(inactive_button!=null){
        inactive_button.classList.remove('active');
      }
    }
    

    // Add 'active' class to the clicked button
    if(button){
      button.classList.add('active');
    }

    this.current_mode = mode;

  }


  insertScooter(){
    let asnwer = window.prompt("Choose new scooter ID:");
    let scooter:Scooter = {
      id: Number(asnwer),
      battery_level: -1,
      number_of_rides: 0,
      total_time: 0,
      inUse: false,
      longitude: -1,
      latitude: -1,
      reserved: false,
      reservation_username: "",
      reservation_time:null,
      driver_username: -1
    }

    if(Number(asnwer)<1){
      alert("Invalid ID");
      return;
    }

    let invalid:boolean = false;

    this.all_scooters.forEach(scooter=>{
      if(scooter.id == Number(asnwer)){
        invalid = true;
      }
    })

    if(invalid){
      alert("ID already exists");
        return;
    }



    this.service.insertScooter(scooter).subscribe(res=>{
      this.all_scooters.push(scooter);
      alert("New scooter added");

      //--------------------------------Reset session timer------------------------- 
      const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
      localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
      //------------------------------End reset session timer------------------------
    })
  }


  delete_user(user:User){
    if(user.username==this.loged_in_user.username){
      alert("You can't remove yourself");
      return;
    }

    let answer = window.confirm("Are you sure that you want to delete "+ user.name_and_surname + " from the system?");
    if(answer){
      this.service.deleteUser(user).subscribe(res=>{
        this.all_users.forEach((current_user,index)=>{
          if(current_user.username == user.username){
            this.all_users.splice(index,1);
          }
        })

        //--------------------------------Reset session timer------------------------- 
        const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
        localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
        //------------------------------End reset session timer------------------------
      })
    }
  }


  delete_scooter(scooter:Scooter){
    let answer = window.confirm("Are you sure that you want to delete this scooter from the system?");
    if(answer){
      this.service.deleteScooter(scooter).subscribe(res=>{
        this.all_scooters.forEach((current_scooter,index)=>{
          if(current_scooter.id == scooter.id){
            this.all_scooters.splice(index,1);
          }
        })
        //--------------------------------Reset session timer------------------------- 
        const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
        localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
      //------------------------------End reset session timer------------------------
      })
    }
  }


  toggle_menu(){
    if(this.menu_active == false){
      this.menu_active = true;
    }
    else{
      this.menu_active = false;
    }
  }


  logout(){
    localStorage.removeItem("LogedInUser");
    localStorage.removeItem("jwt");
    localStorage.removeItem('logoutTime');
    this.router.navigate(['/Login']);
  }
}
