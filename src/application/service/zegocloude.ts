import { I_ZegoCloud } from "../../interface/service_interface/I_Zegocloud";
import { ZEGO_SERVER_SECRET, ZEGO_APP_ID } from "../../infrastructure/constants/env";
import { generateToken04 } from "../../infrastructure/config/zego.cloud.config";

export class ZegoCloud implements I_ZegoCloud {
    constructor() { }

    generateZegoCloudToken(userId:string,classroomId:string):string {
        
        const appID = Number(ZEGO_APP_ID); // type: number
        if(!appID) throw new Error('no app id')
        const serverSecret = ZEGO_SERVER_SECRET;// type: 32 byte length string
        if(!serverSecret) throw new Error('No server secret')
       
        const effectiveTimeInSeconds = 3600; //type: number; unit: s； token expiration time, unit: seconds
        const payloadObject = {
            room_id: classroomId, // Please modify to the user's roomID
            // The token generated in this example allows loginRoom.
            // The token generated in this example does not allow publishStream.
            privilege: {
                1: 1,   // loginRoom: 1 pass , 0 not pass
                2: 0    // publishStream: 1 pass , 0 not pass
            },
            stream_id_list: null
        }; // 
        const payload = JSON.stringify(payloadObject);
       
        const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload);
        console.log('token:', token);
        return token; 
    }
}