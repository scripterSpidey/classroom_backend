

export interface I_S3Bucket{
    uploadProfileImage(imageName:string,buffer:Buffer,contentType:string):Promise<any>;
    uploadClassroomMaterial(fileName:string,file:Buffer,contentType:string):Promise<any>;
    deleteClassroomMaterial():Promise<void>;
}