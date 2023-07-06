import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../../user-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{

  constructor(private router: Router, private service: UserServiceService) { }

  //variables
  message : string = "";
  username: string = "";
  password: string = "";
  subscription: any = null;
  isLoading = false;



  ngOnInit(): void {
    localStorage.removeItem("LogedInUser");
    localStorage.removeItem("jwt");
    localStorage.removeItem('logoutTime');
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
            this.router.navigate(['/AdminPanel']);
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
