import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

@Injectable()
export class RoutesService {
  constructor(
    private readonly reflectorService : Reflector,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) { }

  getRoutes() {
    const routes = [];
    const controllers = this.discoveryService.getControllers();
    for (const wrapper of controllers) {
      const { instance } = wrapper;
      const prototype = Object.getPrototypeOf(instance);
      const keys = Object.getOwnPropertyNames(prototype);
      // this will get the constructor instance of controller if there is any common guard
      let getCommonAuthInstance = this.reflectorService.get('__guards__', instance['constructor']);

      // if there is a common guard then we will use that guard for all the routes
      if(getCommonAuthInstance != undefined){
        for (const key of keys) {
          const routePath: string = Reflect.getMetadata('path', instance[key]);
          const routeMethod: number = Reflect.getMetadata('method', instance[key]);
          if (routePath && routeMethod >= 0) {
            routes.push({
              path: routePath,
              method: routeMethod,
              protected: getCommonAuthInstance[0].name
            });
          }
        }
      } else {
        for (const key of keys) {
          const routePath: string = Reflect.getMetadata('path', instance[key]);
          const routeMethod: number = Reflect.getMetadata('method', instance[key]);
          const guardName = this.reflectorService.get('__guards__', instance[key]);
          if (routePath && routeMethod >= 0) {
            routes.push({
              path: routePath,
              method: routeMethod,
              protected: guardName!= undefined ? guardName[0].name : ""
            });
          }
        }
      }
    }
    return routes;
  }
}