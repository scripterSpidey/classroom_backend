import { I_DayJS } from "../../interface/service_interface/I_DayJS";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export class DayJS implements I_DayJS{

    convertToInternationalTime(date: string, time: string): Date {
        dayjs.extend(utc);
        dayjs.extend(timezone);

        const indianDeadline = `${date}T${time}:00`;

        const utcDeadline = dayjs.tz(indianDeadline,'Asia/kolkata').utc();

        const deadline = utcDeadline.toDate();
        
        return deadline;
    }

    convertToUTC(date:string):Date|string{
        try {
            dayjs.extend(utc);
            dayjs.extend(timezone);
            if(!dayjs(date).isValid()) return 'Invalid date'
            
            const dayjsDate = dayjs.tz(date,'Asia/kolkata');
            return dayjsDate.utc().toDate()
             
        } catch (error) {
            throw error
        }
       
    }

}