export interface User{
    name_and_surname : string;
    username : string;
    password : string;
    role    : string;
    balance: number;
    verified: boolean;
    isDriving: boolean;
    number_of_rides: number;
    total_time: number; //minutes
    reserved_scooter: number; //id of reserved scooter/ -1 if no reservation
    driving_started_timestamp: any
    driving_scooter:number //id of currently driving scooter
}