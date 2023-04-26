
export const fileFilter  = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    console.log("llego vacio", file);

    if(!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    console.log({fileExtension});
    
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if(validExtensions.includes(fileExtension)) return callback(null, true)
    
    callback(null, false);
}