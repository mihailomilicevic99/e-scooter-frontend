import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { User } from '../models/User';
import { Scooter } from '../models/Scooter';
import { Ride } from '../models/Ride';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit, OnDestroy, AfterViewInit {
  constructor(private router: Router, private service: UserServiceService, private platform:Platform) { }


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
  is_mobile_device:boolean = false;

  map:any;
  marker: any;
  center: google.maps.LatLngLiteral = {lat: 44.8125, lng: 20.4612};
  allMarkers: any[] = [];
  latest_position: GeolocationCoordinates = {
    latitude: 44.8125,
    longitude: 20.4612,
    altitude: null,
    accuracy: 3,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  };
  interval1:any;

  //Filters
  battery_from:number=0;
  battery_to:number=100;
  rides_from:number=0;
  rides_to:number=10000;
  hours_from:number=0;
  hours_to:number=10000;

  show_driving_scooters:boolean = true;
  show_reserved_scooters:boolean = true;
  show_free_scooters:boolean = true;
  filter_form_active:boolean = false;


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

    this.filter_form_active = false;
    this.is_mobile_device = this.platform.is('mobile');


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

  ngAfterViewInit(): void {
    this.map = new google.maps.Map(<HTMLElement>document.getElementById("map"), {
      center: this.center,
      zoom: 15
    });

    // Create the button to show user location
    const showLocationButton = document.createElement("button");
    showLocationButton.textContent = "CENTER";

    // Set the style and position of the button
    showLocationButton.style.width = "60px";
    showLocationButton.style.height = "40px";
    showLocationButton.style.backgroundColor = "#ffffff";
    showLocationButton.style.color = "#636060";
    
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(showLocationButton);


    // Add a click event listener to the button
    showLocationButton.addEventListener("click", () => {

      const userLatLng = new google.maps.LatLng(this.latest_position.latitude, this.latest_position.longitude);
    this.map.setCenter(userLatLng);
    this.map.setOptions({zoom: 15});
      
    });



    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        this.latest_position = position.coords;
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Update marker position for user's location
        if (this.marker) {
          this.marker.setPosition(userLocation);
        } else {
          // Add marker for initial user's location
          this.marker = new google.maps.Marker({
            position: userLocation,
            map: this.map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: 'blue',
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: 6
            }
          });
        }

        blinkMarker(this.marker);

        // Function to animate the marker by toggling its visibility
        function blinkMarker(marker:any) {
          setInterval(function() {
            marker.setVisible(!marker.getVisible());
          }, 500); // Adjust the blinking interval (in milliseconds) as needed
        }

        // Center the map on the user's location
        this.map.setCenter(userLocation);
      }, (error) => {
        console.error('Error getting user location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }


    // Apply the grayscale or monochrome style to the map
    const styles = [
      {
        featureType: 'all',
        stylers: [
          { saturation: -20 }, 
        ]
      }
    ];
    this.map.setOptions({ styles: styles });




    var zvezdaraCoords = [
      {lat: 44.8021, lng: 20.5116}, // Northwest coordinate
      {lat: 44.7965, lng: 20.5117}, // Northeast coordinate
      {lat: 44.7923, lng: 20.5024}, // Southeast coordinate
      {lat: 44.7945, lng: 20.4970}, // South coordinate
      {lat: 44.7993, lng: 20.4919}, // Southwest coordinate
      {lat: 44.8026, lng: 20.5034}  // West coordinate
    ];


    var tasmajdanCoords = [
      {lat: 44.8055, lng: 20.4652}, // Northwest coordinate
      {lat: 44.8091, lng: 20.4652}, // Northeast coordinate
      {lat: 44.8091, lng: 20.4842}, // Southeast coordinate
      {lat: 44.8055, lng: 20.4842}, // Southwest coordinate
      {lat: 44.8038, lng: 20.4805}  // Include Elektrotehnicki fakultet coordinate
    ];
    
    
    var polygon_zvezdara = new google.maps.Polygon({
      paths: zvezdaraCoords,
      strokeColor: '#000000', // Black stroke color
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#000000', // Black fill color
      fillOpacity: 0.35
    });


    var polygon_tasmajdan = new google.maps.Polygon({
      paths: tasmajdanCoords,
      strokeColor: '#000000', // Black stroke color
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#000000', // Black fill color
      fillOpacity: 0.35
    });

    polygon_tasmajdan.setMap(this.map); // Add the polygon to the map
    polygon_zvezdara.setMap(this.map);


    this.showScooters();

      this.interval1 = setInterval(() => {
        this.showScooters();
      },10000)


    


    const button = document.getElementById('button1');

    // Remove 'active' class from inactive button
    
      let inactive_button = document.getElementById('button2');
      if(inactive_button!=null){
        inactive_button.classList.remove('active');
      }
    
    
    

    // Add 'active' class to the clicked button
    if(button){
      button.classList.add('active');
    }

    this.current_mode = 'map';
  }


  ngOnDestroy(): void {
    
  }


  showScooters(){
    this.service.getAllScooters().subscribe(res=>{
      // Remove all markers from map
      this.allMarkers.forEach(marker=>{
        marker.setMap(null);
      });
      this.allMarkers = [];
      


      // Create a new instance of the InfoWindow class
      const infoWindow = new google.maps.InfoWindow();

      let filtered_scooters:Scooter[] = [];

      res.forEach(scooter=>{
        if((scooter.reserved!=null && scooter.reservation_username==this.loged_in_user.username)  ||
          (scooter.battery_level>=this.battery_from && scooter.battery_level<=this.battery_to && 
          scooter.number_of_rides>=this.rides_from  && scooter.number_of_rides <= this.rides_to && 
            scooter.total_time>=this.hours_from*60 && scooter.total_time<=this.hours_to*60)){

              if(this.show_reserved_scooters && scooter.reserved){
                filtered_scooters.push(scooter);
              }

              if(this.show_driving_scooters && scooter.inUse){
                filtered_scooters.push(scooter);
              }

              if(this.show_free_scooters && !scooter.reserved && !scooter.inUse){
                filtered_scooters.push(scooter);
              }

              //reserved by admin
              if(this.show_reserved_scooters==false && scooter.reserved && scooter.reservation_username==this.loged_in_user.username){
                filtered_scooters.push(scooter);
              }

            }
      })


      filtered_scooters.forEach(scooter => {


          // Create a custom marker icon
          var customIcon1 = {
            url: 'https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/images/2', // URL to your custom marker icon image
            scaledSize: new google.maps.Size(30, 30)
          };


          var customIcon2 = {
            url: 'https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/images/3', // URL to your custom marker icon image
            scaledSize: new google.maps.Size(30, 30)
          };

          

          //Marker
          const marker = new google.maps.Marker({
              position: {lat: scooter.latitude, lng: scooter.longitude},
              map: this.map
            });

            //Save marker in array 
            this.allMarkers.push(marker);

            // Set the custom icon for the marker
            if(scooter.reservation_username=="" || scooter.reservation_username!=this.loged_in_user.username){
              marker.setIcon(customIcon1);
            }
            else{
              marker.setIcon(customIcon2);
            }
            
            

            //create reserve button for info window
            const reserve_button = document.createElement('button');
            if(scooter.reservation_username==null || scooter.reservation_username!=this.loged_in_user.username){
              reserve_button.textContent = "Reserve";
            }
            else{
              reserve_button.textContent = "Release";
            }
            // Add a click event listener to the button
            reserve_button.addEventListener('click', () => {
            // Call your method or function here
            if(scooter.reservation_username==null || scooter.reservation_username!=this.loged_in_user.username){
              this.hold_scooter(scooter);
            }
            else{
              this.releaseScooter(scooter);
            }
            });
            // Add a CSS class to the button
            reserve_button.style.width = "150px";
            reserve_button.style.height = "30px";
            reserve_button.style.borderRadius = "15%";
            reserve_button.style.backgroundColor = "rgb(40, 213, 156)";
            reserve_button.style.color = "#ffffff";
            reserve_button.style.fontSize = "medium";
            

            //create text for info window
            const textElement1 = document.createElement('p');
            textElement1.textContent = "Battery level: " + scooter.battery_level + "%";
            textElement1.style.fontWeight = "bold";

            //create text for info window
            const textElement2 = document.createElement('p');
            textElement2.textContent = "No. of rides: " + scooter.number_of_rides;
            textElement2.style.fontWeight = "bold";

            //create text for info window
            const textElement3 = document.createElement('p');
            textElement3.textContent = "Hours driven: " + (scooter.total_time/60).toFixed(2) + "h";
            textElement3.style.fontWeight = "bold";

            //create text for info window
            const textElement4 = document.createElement('p');
            textElement4.textContent = "ID: " + scooter.id;
            textElement4.style.fontWeight = "bold";


            // Create a container element for the text and button
            const container = document.createElement('div');
            container.appendChild(textElement4);
            container.appendChild(textElement1);
            container.appendChild(textElement2);
            container.appendChild(textElement3);
            //if(scooter.reservation_username==null || scooter.reservation_username!=this.loged_in_user.username){
              container.appendChild(reserve_button);
            

            
            

            // Add a click event listener to the marker
            marker.addListener('click', () => {
              // Set the content of the info window
              infoWindow.setContent(container);

              // Open the info window on the map at the marker's position
              infoWindow.open(this.map, marker);
            });

        
      });
    })
  }


  hold_scooter(scooter: Scooter){
    if(scooter.reserved){
      alert("Can't reserve this scooter. Already reserved by user");
      return;
    }
    scooter.reserved = true;
    scooter.reservation_username = this.loged_in_user.username;
    scooter.reservation_time = new Date();

    this.service.reserveScooter(scooter.id, this.loged_in_user , scooter.reservation_time).subscribe(res=>{
      this.showScooters();
    })
  }

  releaseScooter(scooter:Scooter){
    scooter.reserved = false;
    scooter.reservation_username = "";
    scooter.reservation_time = null;

    this.service.releaseScooter(scooter.id, this.loged_in_user).subscribe(res=>{
      this.showScooters();
    })
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

    if(this.current_mode=='map'){
      location.reload();
    }

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
      driver_username: -1,
      token: ""
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


  open_filter_menu(){
    this.filter_form_active = true;
  }

  apply_filters(){
    this.showScooters();
    this.filter_form_active = false;
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

