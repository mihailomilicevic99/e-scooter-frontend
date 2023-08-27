import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/User';
import { UserServiceService } from '../user-service.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  constructor(private router: Router, private service: UserServiceService, private platform:Platform) { }


  //----------------------------variables------------------
  loged_in_user:User = {
    name_and_surname : "",
    username : "",
    password : "",
    role    : "",
    balance: 0,
    verified: false,
    isDriving: false,
    number_of_rides: 0,
    total_time: -1,
    reserved_scooter: -1,
    driving_started_timestamp: null,
    driving_scooter: -1
  };
  message : string = "";
  repeat_password: string = "";
  isLoading:boolean=false;
  is_mobile_device:boolean = false;
  //------------------------End variables------------------


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


    this.repeat_password = "";

    this.is_mobile_device = this.platform.is('mobile');
  
  }

  ngOnDestroy(): void {
    
  }


  save(){
    if(this.checkForEmptyFileds() == true){
      this.message = "All fields are mandatory"
      return;
    }

    if(this.checkForInvalidPassword() == true){
      return;
    }
    
    if(this.checkForInvalidRepeatPassword() == true){
      this.message = "Password and repeated password missmatch";
      return;
    }

    this.clearMessage();
    this.isLoading= true;

    this.service.updateUser(this.loged_in_user).subscribe(res =>{

      //--------------------------------Reset session timer------------------------- 
      const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
      localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
      //------------------------------End reset session timer------------------------

      this.isLoading=false;
      this.router.navigate(['/Main']);
    },
    error=>{
      localStorage.removeItem('jwt');
      localStorage.removeItem('LogedInUser');
      this.router.navigate(['/Login']);
    })

    
  }


  checkForEmptyFileds():boolean{
    if(this.isEmpty(this.loged_in_user.name_and_surname) || 
          this.isEmpty(this.loged_in_user.password) || this.isEmpty(this.repeat_password)){
                      return true;
    }
    else{
      return false;
    }
  }


  checkForInvalidPassword(){
    if(this.loged_in_user.password.length < 8){
      this.message = "Password must contain at least 8 characters";
      return true;
    }

    if(this.loged_in_user.password == this.loged_in_user.password.toUpperCase()){ 
      this.message = "Password must contain at least one lower letter";
      return true;
    }

    if(this.loged_in_user.password == this.loged_in_user.password.toLocaleLowerCase()){
      this.message= "Password must contain at least one capital latter"
      return true;
    }

    if(/\d/.test(this.loged_in_user.password) == false){
      this.message= "Password must contain at least one digit"
      return true;
    }

    return false;
  }

  checkForInvalidRepeatPassword():boolean{
    return this.loged_in_user.password==this.repeat_password? false: true;
  }


  clearMessage(){
    this.message="";
  }


  isEmpty(field:any):boolean{
    return (field==undefined || field == "");
  }


  logout(){
    localStorage.removeItem("LogedInUser");
    localStorage.removeItem("jwt");
    localStorage.removeItem('logoutTime');
    this.router.navigate(['/Login']);
  }

}
