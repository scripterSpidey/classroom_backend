import { AppErrorCode } from "./appErrorCodes"

class AppError extends Error{
    constructor(
        public statusCode: number,
        public message: string,
        public errorCode?:AppErrorCode
    ){
        super(message)
    }
}

export default AppError