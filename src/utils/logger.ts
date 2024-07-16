import pino from 'pino';
import dayjs from 'dayjs';
import { pid } from 'process';


const log = pino({
    base:{
        pid:false
    },
    timestamp:()=>`,"time:"${dayjs().format()}`
})

// export default log