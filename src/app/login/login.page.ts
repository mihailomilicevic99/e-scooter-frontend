import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit, OnDestroy{

  constructor(private router: Router, private service: UserServiceService, private platform: Platform, private screenOrientation: ScreenOrientation) { }

  //variables
  message : string = "";
  username: string = "";
  password: string = "";
  subscription: any = null;
  isLoading = false;
  is_mobile_device: boolean = true;



  ngOnInit(): void {
    localStorage.removeItem("LogedInUser");
    localStorage.removeItem("jwt");
    localStorage.removeItem('logoutTime');

    this.message  = "";
    this.username = "";
    this.password = "";

    this.is_mobile_device = this.platform.is('mobile');

  }

  ngOnDestroy(): void{
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }


  login(){
    if(this.isEmpty(this.username) || this.isEmpty(this.password)){
      this.message = "Username or password can't be empty";
      return;
    }
    
    this.isLoading = true;
    this.subscription =  this.service.login(this.username, this.password).subscribe(data=>{
       this.isLoading = false;
        const jwt = data['token'];
        const user = data.user[0];

        if(user == null || Object.keys(user).length == 0){

          //login unsuccessful
          this.username = "";
          this.password = "";
          this.message = "Username or password incorrect"
        }
        else{
          //login successful 
          this.message  = "";
          this.username = "";
          this.password = "";
          localStorage.setItem("LogedInUser", JSON.stringify(user));
          this.message = "";
          if(jwt){
            localStorage.setItem('jwt', jwt);
          }
          else{
            alert("no jwt")
          }
          

          //------------------------Automatically logout--------------------------------------
          const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
          localStorage.setItem('logoutTime', scheduledLogoutTime.toString());

          const logoutTime = 30*60*1000; //30 minutes
          setTimeout(() => {
            localStorage.removeItem('jwt');
            localStorage.removeItem('LogedInUser');
            alert("Your session has expired");
            this.router.navigate(['/Login']);
            
          }, logoutTime);
          //------------------------End utomatically logout--------------------------------------

          if(user.role == "admin"){
            this.router.navigate(['/Admin']);
          }
          else{
            this.router.navigate(['/Main']);
          }
        }
    })
  }


  clearMessage(){
    this.message="";
  }


  isEmpty(field:any):boolean{
    return (field==undefined || field == "");
  }

}
