import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AgentServerProxyService } from './infrastructure/agent-server-proxy.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AGENT_SERVER',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: configService.get('AGENT_SERVER_MSG_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [AgentServerProxyService],
  exports: [AgentServerProxyService],
})
export class EventMessagesModule {}
