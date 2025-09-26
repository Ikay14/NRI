import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => {
              const uri = configService.get<string>('RABBIT_MQ_URI');
              const queue = configService.get<string>(`RABBIT_MQ_${name}_QUEUE`);
              if (!uri) {
                throw new Error('RABBIT_MQ_URI is not defined in configuration');
              }
              if (!queue) {
                throw new Error(`RABBIT_MQ_${name}_QUEUE is not defined in configuration`);
              }
              return {
                transport: Transport.RMQ,
                options: {
                  urls: [uri],
                  queue: queue,
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}