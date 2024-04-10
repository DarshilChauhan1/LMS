import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus} from '@nestjs/common';
import {Request, Response} from 'express'

@Catch()
export class ExceptionHandling implements ExceptionFilter{
   catch(exception: HttpException, host: ArgumentsHost): void {
       // Get the HTTP context from the ArgumentsHost
       const ctx = host.switchToHttp();
       // Get the request and response objects
       const request = ctx.getRequest<Request>();
       const response = ctx.getResponse<Response>();
       // If the exception is an HttpException, get the response, else, use an empty object
       const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : {};
       // Get the HTTP status code from the exception. If it is not an HttpException, use 500.
       const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
       // Construct the response body object
       const responseBody = {
           statusCode: httpStatus, // HTTP status code
           message: exceptionResponse['message'] || exception.message || "Something went wrong", // Error message
           path: request.url, // Requested URL
           success: httpStatus == (200 || 201) // Flag indicating success
       };
       // If a redirect URL is provided in the exception response, add it to the response body
       if(exceptionResponse['redirectTo']) responseBody['redirectTo'] = exceptionResponse['redirectTo'];
       // Send the error response with the appropriate status code
       response.status(httpStatus).send(responseBody);
   }
}
