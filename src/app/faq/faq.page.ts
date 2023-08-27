import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { UserServiceService } from '../user-service.service';


@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
  providers: [ScreenOrientation]
})
export class FaqPage implements OnInit, OnDestroy {

  is_mobile_device: boolean = false;


  subscription2: any = null;
  formDataImage:any;
  image_available:boolean = false;
  image_src:string="";

  constructor(private platform: Platform, private screenOrientation: ScreenOrientation, private service:UserServiceService) { }

  ngOnInit() {
    this.is_mobile_device = this.platform.is('mobile');
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  ngOnDestroy(): void {
    this.screenOrientation.unlock();
  }



  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.formDataImage = new FormData();
    this.formDataImage.append("image", file, file.name);
    this.image_available = true;

    //----------------showing choosen image on page------------------
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.image_src = event.target.result;
    };
    reader.readAsDataURL(file);
    //-----------------End showing choosen image on page---------------

    this.save();
  }




  save(){
    this.subscription2 = this.service.insertImage(this.formDataImage, 3).subscribe(res=>{   //------saving image------
      alert("image saved")
    });
  }

}
