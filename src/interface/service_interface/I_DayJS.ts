
export interface I_DayJS{
    convertToInternationalTime(date:string,time:string):Date;
    convertToUTC(date:string):Date|string;
}