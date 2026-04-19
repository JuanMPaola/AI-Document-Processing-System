import { Module } from '@nestjs/common';
import { ProcessGateway } from './process.gateway';

@Module({
  providers: [ProcessGateway],
  exports: [ProcessGateway],
})
export class RealtimeModule {}