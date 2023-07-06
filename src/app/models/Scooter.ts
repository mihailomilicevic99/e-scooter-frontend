export interface Scooter{
    id: number;
    battery_level: number;
    number_of_rides: number;
    total_time: number; //minutes
    inUse: boolean;
    longitude: number;
    latitude: number;
    reserved: boolean;
    reservation_username: string;
    reservation_time:any;
    driver_username: any;
}