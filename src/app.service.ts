import { Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Injectable()
export class AppService {
    constructor(private readonly httpAdaptorHost: HttpAdapterHost) { }
    getAllRoutes(){
     const httpAdapter = this.httpAdaptorHost.httpAdapter;
     const httpServer = httpAdapter.getHttpServer();
     const routes = httpServer._events.request._router.stack
     
     const availableRoutes: [] = routes
     .map(layer => {
       if (layer.route) {
         return {
           route: {
             path: layer.route?.path,
             method: layer.route?.stack[0].method,
           },
         };
       }
     })
     .filter(item => item !== undefined);
     return availableRoutes;
    }
}
