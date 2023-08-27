import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.page.html',
  styleUrls: ['./forgotten-password.page.scss'],
})
export class ForgottenPasswordPage implements OnInit, OnDestroy {

  constructor(private router: Router, private service: UserServiceService, private platform: Platform) { }


//----------------------------variables------------------
email: string = "";
submited:boolean = false;
message: string = "";
subscription: any = null;
is_mobile_device: boolean = true;
//------------------------End variables------------------



  ngOnInit(): void {
    this.submited = false;
    this.email="";

    this.is_mobile_device = this.platform.is('mobile');
  }


  ngOnDestroy(): void {
    this.submited = false;
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }


  jump_to_login(){
    this.router.navigate(['/Login']);
  }


  submit(){
    if(this.isEmpty(this.email)){
      this.message = "You must provide email";
      return;
    }

    this.subscription = this.service.checkIfEmailExists(this.email).subscribe(res=>{
      if(res == false){
        this.message = "Account associate with this email does not exist";
        return;
      }
      //send an email for password reset
      this.submited = true;
    });
  }


  isEmpty(field:any):boolean{
    return (field==undefined || field == "");
  }


  clearMessage(){
    this.message="";
  }


}

