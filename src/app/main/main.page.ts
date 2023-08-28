import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { GoogleMap } from '@capacitor/google-maps';
import { User } from '../models/User';
import { UserServiceService } from '../user-service.service';
import {  Router } from '@angular/router';
import { Ride } from '../models/Ride';
import { Scooter } from '../models/Scooter';
//import { NfcServiceService } from '../nfc-service.service';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { Platform } from '@ionic/angular';


declare global {
  interface Window {
    googleMapsCallback: () => void;
  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit, OnDestroy, AfterViewInit{

  //variables
  nfc:NFC = new NFC();
  ndef:Ndef = new Ndef();
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
  map: any;
  marker: any;
  center: google.maps.LatLngLiteral = {lat: 44.8125, lng: 20.4612};
  watchId: number = 0;
  interval:any;
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
  
  defaultMapOptions:any;
  driving_time = {
    hours: 0,
    minutes: 0,
    seconds: 0
  }

  interval1:any;
  price_per_second: number = 0.3/60;
  scooter: Scooter = {
    id: -1,
    battery_level: -1,
    number_of_rides: -1,
    total_time: -1, //minutes
    inUse: false,
    longitude: -1,
    latitude: -1,
    reserved: false,
    reservation_username: "",
    reservation_time: null,
    driver_username: "",
    token: ""
  }
  is_mobile_device:boolean=false;
  current_balance:number=0;
  in_black_zone:boolean = false;
  waiting_for_nfc_target:boolean = false;
  goAhead:boolean = true; //synchronization

  constructor(private router: Router, private service: UserServiceService, private platform: Platform) { }


  ngAfterViewInit(): void {
    //document.addEventListener('DOMContentLoaded', () => {
    this.load_map()
    //});

  }


   load_map(){
      this.map = new google.maps.Map(<HTMLElement>document.getElementById("map"), {
        center: this.center,
        zoom: 15
    });


    //ask for permission for location
    
     /* this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
        .then(status => {
          if (status.hasPermission) {
            //this.getLocation();
          } else {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
              .then(requestStatus => {
                if (requestStatus.hasPermission) {
                  //this.getLocation();
                } else {
                  console.error('Location permission denied.');
                }
              });
          }
        });*/
    
    
   
    



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

    var zeleno_brdo_coords= [
      {lat: 44.7676992, lng: 20.5317853333}, 
      {lat: 44.795, lng: 20.530}, // Random vertex 1
      {lat: 44.801, lng: 20.510}, // Random vertex 2
      {lat: 44.794, lng: 20.495}, // Random vertex 3
      {lat: 44.788, lng: 20.500}  // Random vertex 4
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

    


    var polygon_zeleno_brdo =new google.maps.Polygon({
      paths: zeleno_brdo_coords,
      strokeColor: '#000000', // Black stroke color
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#000000', // Black fill color
      fillOpacity: 0.35
    });



    polygon_tasmajdan.setMap(this.map); // Add the polygon to the map
    polygon_zvezdara.setMap(this.map);
    //polygon_zeleno_brdo.setMap(this.map);



    //update loged in user from the database and if he is driving adjust the driving mode
    this.service.login(this.loged_in_user.username, this.loged_in_user.password).subscribe(res=>{
      const jwt = res['token'];
      if(jwt){
        localStorage.setItem('jwt', jwt);
      }
      else{
        alert("no jwt")
      }

      this.loged_in_user = res.user[0];
      if(this.loged_in_user.isDriving==true){
        //set the view to ride mode
        const drivingMapStyle = [
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              { hue: "#ff4400" },
              { saturation: -68 },
              { lightness: -4 },
              { gamma: 0.72 },
            ],
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [
              { visibility: "off" },
            ],
          },
          {
            featureType: "landscape",
            elementType: "labels",
            stylers: [
              { visibility: "off" },
            ],
          },
          {
            featureType: "water",
            elementType: "labels",
            stylers: [
              { visibility: "off" },
            ],
          },
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [
              { visibility: "off" },
            ],
          },
          
        ];
        
        //change map style
        this.map.setOptions({ styles: drivingMapStyle });
        const userLatLng = new google.maps.LatLng(this.latest_position.latitude, this.latest_position.longitude);
        this.map.setCenter(userLatLng);
        this.map.setOptions({zoom: 15});
    
        //change user location pointer
        var icon = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: 'green',
          fillOpacity: 0.8,
          strokeWeight: 0,
          scale: 6
        }

        if(this.marker){
          this.marker.setIcon(icon);
        }
        else{
          //location.reload();
        }
     

        this.updateScootersLocation();

    
        //start the counter
        this.interval1 = setInterval(() => {
          this.update_time();
        },1000)

        }
      })


      this.updateScootersLocation();

      this.interval1 = setInterval(() => {
        this.updateScootersLocation();
      },10000)
      

  }

  ngOnDestroy(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    if(this.interval){
      clearInterval(this.interval);
    }
    
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
    


    this.current_balance = Number(this.loged_in_user.balance.toFixed(2));

    var scooter = localStorage.getItem("driving_scooter");
    if(scooter != null){
      this.scooter = JSON.parse(scooter);
    }

    this.is_mobile_device = this.platform.is('mobile');
  


  }

  
  checkReservations(){
    this.service.getAllScooters().subscribe(res=>{
      res.forEach(scooter=>{
        const current_time = new Date();
        if(scooter.reserved == true && scooter.reservation_username!='admin' &&  current_time.getTime() - (new Date(scooter.reservation_time)).getTime() >= 30*1000){ //10 minutes in miliseconds - 30 seconds for testing purposes
          let user:User = {
            name_and_surname : "",
            username : scooter.reservation_username,
            password : "",
            role    : "",
            balance: 0,
            verified: false,
            isDriving: false,
            number_of_rides: 0,
            total_time: 0,
            reserved_scooter: -1,
            driving_started_timestamp: null,
            driving_scooter: -1
          }
          this.service.releaseScooter(scooter.id, user).subscribe(res=>{
            this.service.updateUser(user).subscribe(res=>{
              if(this.loged_in_user.username == user.username){
                this.loged_in_user.reserved_scooter = -1;
                alert("Your reservation is cancelled")
              }
            })
          })
        }
      })

      //--------------------------------Reset session timer------------------------- 
      const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
      localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
      //------------------------------End reset session timer------------------------
    });
  }


  //y is longitude; x is latitude
  isPointInPolygon(x: number, y: number, vertex:number): boolean {

    //Tasmajdan coords
    var polygon = [
      {x: 44.8055, y: 20.4652}, // Northwest coordinate
      {x: 44.8091, y: 20.4652}, // Northeast coordinate
      {x: 44.8091, y: 20.4842}, // Southeast coordinate
      {x: 44.8055, y: 20.4842}, // Southwest coordinate
      {x: 44.8038, y: 20.4805}  // Include Elektrotehnicki fakultet coordinate
    ];



    let isInside = false;
    let j = vertex - 1;
  
    for (let i = 0; i < vertex; i++) {
      if ((polygon[i].y < y && polygon[j].y >= y) ||
          (polygon[j].y < y && polygon[i].y >= y)) {
        if (polygon[i].x + (y - polygon[i].y) /
            (polygon[j].y - polygon[i].y) *
            (polygon[j].x - polygon[i].x) <
            x) {
          isInside = !isInside;
        }
      }
      j = i;
    }
    return isInside;
  }
  
  
  
  
  
  




updateScootersLocation(){

  //check if user is in black zone
  if(this.loged_in_user.isDriving == true){
    if (navigator.geolocation) {
      let userLocation:any;
      navigator.geolocation.getCurrentPosition((position) => {
        this.latest_position = position.coords;
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        
         let overlay = document.getElementById('warning');
        
        
        if(this.isPointInPolygon(userLocation.lat, userLocation.lng,5)==true){
        
        if(this.is_mobile_device==false && overlay!=null){
          overlay.textContent = 'Leave the black zone';
          overlay.style.position = 'absolute';
          overlay.style.top = '250px';
          overlay.style.left = '580px';
          overlay.style.fontSize = '24px';
          overlay.style.backgroundColor = 'red';
          overlay.style.padding = '10px';
          overlay.style.borderRadius = '5px';
        }
        else{
          if(overlay!=null){
            overlay.textContent = 'Leave the black zone';
            overlay.style.position = 'absolute';
            overlay.style.top = '180px';
            overlay.style.left = '80px';
            overlay.style.fontSize = '24px';
            overlay.style.backgroundColor = 'red';
            overlay.style.padding = '10px';
            overlay.style.borderRadius = '5px';
          }
        }

       
        if (overlay) {
          overlay.style.display = 'block';
          this.in_black_zone = true;
        }
        }
        else{
          this.in_black_zone = false;
          if (overlay!=null) {
            overlay.style.display = 'none';
          }
        }
      });

    

    }
  }


  //check if reservation expired for each scooter
  this.checkReservations();

  if(this.loged_in_user.reserved_scooter == -1){
    this.service.getAllScooters().subscribe(res=>{
      // Remove all markers from map
      this.allMarkers.forEach(marker=>{
        marker.setMap(null);
      });
      this.allMarkers = [];
      


      // Create a new instance of the InfoWindow class
      const infoWindow = new google.maps.InfoWindow();


      res.forEach(scooter => {
        if(scooter.battery_level>5 && scooter.inUse==false && scooter.reserved == false && this.loged_in_user.isDriving==false){
          // Create a custom marker icon
          var customIcon = {
            url: 'https://e-scooter-backend-9c20d666a97d.herokuapp.com/api/images/2', // URL to your custom marker icon image
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
            marker.setIcon(customIcon);
            

            //create reserve button for info window
            const reserve_button = document.createElement('button');
            reserve_button.textContent = "Reserve";
            // Add a click event listener to the button
            reserve_button.addEventListener('click', () => {
            // Call your method or function here
              this.reserve_scooter(scooter.id);
            });
            // Add a CSS class to the button
            reserve_button.style.width = "150px";
            reserve_button.style.height = "30px";
            reserve_button.style.borderRadius = "15%";
            reserve_button.style.backgroundColor = "rgb(40, 213, 156)";
            reserve_button.style.color = "#ffffff";
            reserve_button.style.fontSize = "medium";

            //create text for info window
            const textElement = document.createElement('p');
            textElement.textContent = "Battery level: " + scooter.battery_level + "%";
            textElement.style.fontWeight = "bold";


            // Create a container element for the text and button
            const container = document.createElement('div');
            container.appendChild(textElement);
            container.appendChild(reserve_button);

            
            

            // Add a click event listener to the marker
            marker.addListener('click', () => {
              // Set the content of the info window
              infoWindow.setContent(container);

              // Open the info window on the map at the marker's position
              infoWindow.open(this.map, marker);
            });

        }
      });
    })
  }
  else{ //user has reserved scooter - same code but for only one scooter
    this.service.getScooter(this.loged_in_user.reserved_scooter).subscribe(res=>{
      
        // Remove all markers from map
        this.allMarkers.forEach(marker=>{
          marker.setMap(null);
        });
        this.allMarkers = [];
  
  
        // Create a new instance of the InfoWindow class
        const infoWindow = new google.maps.InfoWindow();
  
        let scooter = res[0];
       
          if(scooter.reserved == true && this.loged_in_user.isDriving==false){
            // Create a custom marker icon
            var customIcon = {
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
              marker.setIcon(customIcon);

              marker.setAnimation(google.maps.Animation.BOUNCE);
              // Stop bouncing after 2 seconds
              setTimeout(() => {
                marker.setAnimation(null); // Set animation to null to stop bouncing
              }, 2000);
            

  
              //create reserve button for info window
              const reserve_button = document.createElement('button');
              reserve_button.textContent = "Release";
              // Add a click event listener to the button
              reserve_button.addEventListener('click', () => {
              // Call your method or function here
                this.release_scooter(scooter.id);
              });
              // Add a CSS class to the button
              reserve_button.style.width = "150px";
              reserve_button.style.height = "30px";
              reserve_button.style.borderRadius = "15%";
              reserve_button.style.backgroundColor = "rgb(40, 213, 156)";
              reserve_button.style.color = "#ffffff";
              reserve_button.style.fontSize = "medium";
  
              //create text for info window
              const textElement = document.createElement('p');
              textElement.textContent = "Battery level: " + scooter.battery_level + "%";
              textElement.style.fontWeight = "bold";
  
  
              // Create a container element for the text and button
              const container = document.createElement('div');
              container.appendChild(textElement);
              container.appendChild(reserve_button);
  
              
              
  
              // Add a click event listener to the marker
              marker.addListener('click', () => {
                // Set the content of the info window
                infoWindow.setContent(container);
  
                // Open the info window on the map at the marker's position
                infoWindow.open(this.map, marker);
              });
  
          }
      })
    
  }
}


  release_scooter(id: number){
    this.loged_in_user.reserved_scooter = -1;
    this.service.releaseScooter(id, this.loged_in_user).subscribe(res=>{
      this.service.updateUser(this.loged_in_user).subscribe(res=>{
        localStorage.setItem("LogedInUser", JSON.stringify(this.loged_in_user));
        this.updateScootersLocation();
        alert("Reservation cancelled")
        //--------------------------------Reset session timer------------------------- 
        const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
        localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
        //------------------------------End reset session timer------------------------
      });
    });
  }



  reserve_scooter(id: number){
    if(this.loged_in_user.reserved_scooter != -1){
      alert("You already reserved another scooter");
    }
    else{
      const reservation_time = new Date();
      this.loged_in_user.reserved_scooter = id;
      this.service.reserveScooter(id, this.loged_in_user, reservation_time).subscribe(res=>{
        this.service.updateUser(this.loged_in_user).subscribe(res=>{
          localStorage.setItem("LogedInUser", JSON.stringify(this.loged_in_user));
          this.updateScootersLocation();
          alert("Your reservation is valid for next 10 minutes");
          //--------------------------------Reset session timer------------------------- 
          const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
          localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
          //------------------------------End reset session timer------------------------
        })
      
      });
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


  
  writeTag(message: string) {
    let messageBytes = this.ndef.textRecord(message);
    let id = 1; //scooter id

    this.nfc.addNdefListener(() => {
      console.log('successfully attached ndef listener');
    }, (err:any) => {
      console.log('error attaching ndef listener', err);
      this.service.deleteToken(id).subscribe(res=>{
        this.waiting_for_nfc_target = false;
      })
    }).subscribe((event) => {
      this.nfc.write([messageBytes])
    .then(async () => {
      console.log('NFC sharing successful.');
      this.waiting_for_nfc_target = false;
      //wait until scooter got token from DB
      let timer_start = new Date();
      let activated:boolean = false;
      while((new Date().getTime() - timer_start.getTime() < 1000*20) && activated==false){ //checking for token 2 minutes
          console.log("request")
          this.service.getToken(id).subscribe(res=>{
            if(res.token == ""){
              activated = true;
            }
          });
          await new Promise(resolve => setTimeout(resolve, 3000));
      }

      if(activated==false){
        console.log("time out")
        this.service.deleteToken(id).subscribe(res=>{
          this.waiting_for_nfc_target = false;
        })
        return;
      }
      console.log("scooter unlocked")
      this.after_nfc_auth();
    })
    .catch((error) => {
      console.error('NFC sharing error:', error);
      this.service.deleteToken(id).subscribe(res=>{
        this.waiting_for_nfc_target = false;
      })
    });
    });

    
  }

  
    start_ride(){
    let id = 1; //scooter id

    if(this.loged_in_user.balance<=0){
      alert("You don't have enough funds on your account. Please settle your dues");
      return;
    }

    //Check if choosen scooter is reserved
    this.service.getScooter(id).subscribe(res=>{
      this.scooter = res[0];
      localStorage.setItem("driving_scooter", JSON.stringify(this.scooter));
      if(this.scooter.reserved==true){
        if(this.scooter.reservation_username != this.loged_in_user.username){
          alert("This scooter is reserved")
          return;
        }
      }


      //check if choosen scooter is in use
      if(this.scooter.inUse==true){
        if(this.scooter.driver_username != this.loged_in_user.username){
          alert("This scooter is reserved")
          return;
        }
        else{
          alert("You already unlocked this scooter");
          return;
        }
      }

    });

    this.waiting_for_nfc_target = true;
    let token = this.generateRandomToken(11);
    this.service.insertToken(id, token).subscribe(async res=>{
      //this.writeTag('NFC mobile!');
      this.writeTag(token);
      console.log(token)
    })
    
  }  


   


  generateRandomToken(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }

    return token;
  }


  after_nfc_auth(){  
    let id = 1; //scooter id

    this.service.getScooter(id).subscribe(res=>{
      this.scooter = res[0];


      //release scooter if there is any reserved by current user
      if(this.loged_in_user.reserved_scooter!=-1){
        this.release_scooter(this.loged_in_user.reserved_scooter);
      }
  
      this.loged_in_user.isDriving = true;
      this.loged_in_user.driving_scooter = id;

      this.scooter.inUse = true;
      this.scooter.driver_username = this.loged_in_user.username;
      this.scooter.reservation_time = "";
  
      const drivingMapStyle = [
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [
            { hue: "#ff4400" },
            { saturation: -68 },
            { lightness: -4 },
            { gamma: 0.72 },
          ],
        },
        {
          featureType: "road",
          elementType: "labels",
          stylers: [
            { visibility: "off" },
          ],
        },
        {
          featureType: "landscape",
          elementType: "labels",
          stylers: [
            { visibility: "off" },
          ],
        },
        {
          featureType: "water",
          elementType: "labels",
          stylers: [
            { visibility: "off" },
          ],
        },
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [
            { visibility: "off" },
          ],
        },
        
      ];
      
      //change map style
      this.map.setOptions({ styles: drivingMapStyle });
      const userLatLng = new google.maps.LatLng(this.latest_position.latitude, this.latest_position.longitude);
      this.map.setCenter(userLatLng);
      this.map.setOptions({zoom: 15});
      
      //save start time
      this.loged_in_user.driving_started_timestamp = new Date();
  
      this.service.updateUser(this.loged_in_user).subscribe(res=>{
        this.service.updateScooter(this.scooter).subscribe(res=>{
          //change user location pointer
          var icon = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: 'green',
            fillOpacity: 0.8,
            strokeWeight: 0,
            scale: 6
          }
  
          if(this.marker){
            this.marker.setIcon(icon);
          }
          else{
            //location.reload();
          }
       
  
          this.updateScootersLocation();
  
      
          //start the counter
          this.interval1 = setInterval(() => {
            this.update_time();
          },1000)



          //--------------------------------Reset session timer------------------------- 
          const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
          localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
          //------------------------------End reset session timer------------------------
        })

      })

    })

    
  }

  //driving timer
  update_time(){

    let timeDiff = (new Date()).getTime() - new Date(this.loged_in_user.driving_started_timestamp).getTime();

    this.driving_time.hours = Math.floor(timeDiff / (1000 * 60 * 60));
    this.driving_time.minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    this.driving_time.seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  }


  lock_scooter(){
    let token = this.generateRandomToken(11);
    let id = this.loged_in_user.driving_scooter;
    this.service.insertToken(id, token).subscribe(async res=>{
      this.waiting_for_nfc_target = true; //show loading sign
      
      //wait until scooter got token from DB
      let timer_start = new Date();
      let activated:boolean = false;
      while((new Date().getTime() - timer_start.getTime() < 1000*30) && activated==false){ //checking for token 2 minutes
          this.service.getToken(id).subscribe(res=>{
            if(res.token == ""){
              activated = true;
            }
          });
          await new Promise(resolve => setTimeout(resolve, 3000));
      }

      if(activated==false){
        console.log("time out")
        return;
      }

      console.log("Scooter locked");
      this.after_end_ride();
    })
  }


  end_ride(){
    this.lock_scooter();
  }


  after_end_ride(){
    let end_time = new Date();
    this.loged_in_user.isDriving = false;
    this.map.setOptions({styles: this.defaultMapOptions});

    //change user location pointer
    var icon = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'blue',
      fillOpacity: 0.8,
      strokeWeight: 0,
      scale: 6
    }

    if(this.marker){
      this.marker.setIcon(icon);
    }

    if(this.interval1){
      clearInterval(this.interval1);
    }

    //this.updateScootersLocation();


    //Save ride data and update user and scooter
    let ride:Ride = {
      scooter_id: this.loged_in_user.driving_scooter,
      user_id: this.loged_in_user.username,
      start_time: this.loged_in_user.driving_started_timestamp,
      end_time: end_time,
      price: (end_time.getTime() - new Date(this.loged_in_user.driving_started_timestamp).getTime())*this.price_per_second/1000,
      duration: (end_time.getTime() - new Date(this.loged_in_user.driving_started_timestamp).getTime())/1000/60
    }

    this.scooter.number_of_rides = this.scooter.number_of_rides + 1;
    this.scooter.total_time = this.scooter.total_time + (end_time.getTime() - new Date(this.loged_in_user.driving_started_timestamp).getTime())/1000/60;
    this.scooter.inUse = false;
    this.scooter.driver_username = "";

    this.loged_in_user.number_of_rides = this.loged_in_user.number_of_rides + 1;
    this.loged_in_user.total_time = this.loged_in_user.total_time + (end_time.getTime() - new Date(this.loged_in_user.driving_started_timestamp).getTime())/1000/60;
    this.loged_in_user.driving_scooter = -1;
    this.loged_in_user.driving_started_timestamp = "";
    this.loged_in_user.balance = this.loged_in_user.balance - ride.price;
    if(this.loged_in_user.balance<0){
      alert("Your account does not have enough funds. Please settle your dues as soon as possible");
    }
    this.current_balance = Number((this.current_balance - ride.price).toFixed(2));
    localStorage.setItem("LogedInUser", JSON.stringify(this.loged_in_user));

    this.service.insertRide(ride).subscribe(res=>{
      this.service.updateUser(this.loged_in_user).subscribe(res=>{
        this.service.updateScooter(this.scooter).subscribe(res=>{
          this.updateScootersLocation();
          localStorage.removeItem("driving_scooter");
          //--------------------------------Reset session timer------------------------- 
          const scheduledLogoutTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes from now
          localStorage.setItem('logoutTime', scheduledLogoutTime.toString());
          //------------------------------End reset session timer------------------------
        })
      })
    })


    

    //TO DO: lock scooter
  }


  logout(){
    localStorage.removeItem("LogedInUser");
    localStorage.removeItem("jwt");
    localStorage.removeItem('logoutTime');
    this.router.navigate(['/Login']);
  }


  


}

