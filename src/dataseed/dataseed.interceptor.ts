import { Injectable, NestInterceptor, ExecutionContext, CallHandler, CanActivate } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CHECK_GUARD_NAME } from 'src/common/decorators/guardName.decorator';
import { IS_PROTECTED_KEY } from 'src/common/decorators/UseCustomGuards.decorator';

@Injectable()
export class RoutesService {
  constructor(
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
      if (instance && keys) {
        for (const key of keys) {
          const routePath: string = Reflect.getMetadata('path', instance[key]);
          const routeMethod: number = Reflect.getMetadata('method', instance[key]);
          const guardName: string = Reflect.getMetadata('__guards__', instance[key]);
          if (routePath && routeMethod >= 0) {
            routes.push({
              path: routePath,
              method: routeMethod,
              protected: guardName
            });
          }
        }

      } else continue;

    }
    return routes;
  }
}