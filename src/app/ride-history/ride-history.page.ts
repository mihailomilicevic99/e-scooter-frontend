import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { Ride } from '../models/Ride';
import { User } from '../models/User';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.page.html',
  styleUrls: ['./ride-history.page.scss'],
  providers: [ScreenOrientation]
})
export class RideHistoryPage implements OnInit, OnDestroy{
  constructor(private router: Router, private service: UserServiceService, private platform:Platform, private screenOrientation: ScreenOrientation) { }


  all_rides:Ride[] = [];
  loading_rides:boolean = true;

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

  total_price:Number = 0;
  is_mobile_device:boolean = false;

  ngOnDestroy(): void {
    this.screenOrientation.unlock();
  }

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


    this.is_mobile_device = this.platform.is('mobile');
  

    this.service.getRidesByUser(this.loged_in_user.username).subscribe(res=>{
      this.all_rides = res;
      this.total_price = 0;
      this.loading_rides = false;
      this.all_rides.forEach(ride=>{
        ride.duration = Number(ride.duration.toFixed(2));
        this.total_price = Number(this.total_price) + ride.price;
        this.total_price = Number(this.total_price.toFixed(2))
        ride.price = Number(ride.price.toFixed(2));
      })

      //--------------------------------Reset session timer------------------------- 
      const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
      localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
      //------------------------------End reset session timer------------------------
    })


    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }



  logout(){
    localStorage.removeItem("LogedInUser");
    localStorage.removeItem("jwt");
    localStorage.removeItem('logoutTime');
    this.router.navigate(['/Login']);
  }
}
