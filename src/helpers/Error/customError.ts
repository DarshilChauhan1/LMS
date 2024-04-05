import { HttpException } from "@nestjs/common";


//Custom Error for multiple fields
export class CustomError extends HttpException {
    constructor(message: string, statusCode: number, sucess: boolean, redirectTo?: string) {
        super({ message, redirectTo, sucess }, statusCode)
    }
}