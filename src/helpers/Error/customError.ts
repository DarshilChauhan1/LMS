import { HttpException } from "@nestjs/common";


//Custom Error for multiple fields
export class CustomError extends HttpException {
    constructor(message: string, statusCode: number,  redirectTo?: string, sucess: boolean = false) {
        super({ message, redirectTo, sucess }, statusCode)
    }
}