import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../../user-service.service';
import { User } from '../models/User';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy{

  constructor(private router: Router, private service: UserServiceService) { }


  //----------------------------variables------------------
  message : string = "";
  name : string="";
  username: string = "";
  password: string = "";
  password_repeat: string = "";
  registration_successful: boolean = false;
  subscription: any = null;
  //----------------------------End variables -----------------



  ngOnInit(): void {
    this.registration_successful = false;
  }

  ngOnDestroy(): void {
    this.registration_successful = false;
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }


  register(){
    //-----------------------Check for valid data ----------------------------------------------
    if(this.checkForEmptyFileds()==true){
      this.message = "All fields are mandatory to fill";
      this.password = "";
      this.password_repeat="";
      return;
    }

    if(this.checkForInvalidPassword()==true){
      this.password = "";
      this.password_repeat="";
      return;
    }

    if(this.checkForInvalidRepeatPassword()==true){
      this.password = "";
      this.password_repeat="";
      this.message = "Password and repeated password missmatch";
      return;
    }
    //-------------------End check for valid data ----------------------------------------------



    //-----------------------Registartion process ---------------------------------------------------

    let user:User = {
      name_and_surname: this.name,
      username : this.username,
      password : this.password,
      role    : "customer",
      balance : 0,
      verified: false,
      isDriving: false,
      number_of_rides: 0,
      total_time: 0,
      reserved_scooter: -1,
      driving_started_timestamp: null,
      driving_scooter: -1
    };

    this.subscription = this.service.insertUser(user).subscribe(res=>{});
    this.registration_successful = true;


    //-----------------------End registartion process -----------------------------------------------


  }


  jump_to_login(){
    this.router.navigate(['/Login']);
  }


  clearMessage(){
    this.message="";
  }


  isEmpty(field:any):boolean{
    return (field==undefined || field == "");
  }


  checkForEmptyFileds():boolean{
    if(this.isEmpty(this.name) || this.isEmpty(this.username) || 
          this.isEmpty(this.password) || this.isEmpty(this.password_repeat)){
                      return true;
    }
    else{
      return false;
    }
  }


  checkForInvalidPassword(){
    if(this.password.length < 8){
      this.message = "Password must contain at least 8 characters";
      return true;
    }

    if(this.password == this.password.toUpperCase()){ 
      this.message = "Password must contain at least one lower letter";
      return true;
    }

    if(this.password == this.password.toLocaleLowerCase()){
      this.message= "Password must contain at least one capital latter"
      return true;
    }

    if(/\d/.test(this.password) == false){
      this.message= "Password must contain at least one digit"
      return true;
    }

    return false;
  }

  checkForInvalidRepeatPassword():boolean{
    return this.password==this.password_repeat? false: true;
  }

}
