import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../../user-service.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css']
})
export class ForgottenPasswordComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private service: UserServiceService) { }


//----------------------------variables------------------
email: string = "";
submited:boolean = false;
message: string = "";
subscription: any = null;
//------------------------End variables------------------



  ngOnInit(): void {
    this.submited = false;
    this.email="";
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
