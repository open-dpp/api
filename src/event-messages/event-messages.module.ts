import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AgentServerProxyService } from './infrastructure/agent-server-proxy.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'AGENT_SERVER',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: parseInt(configService.get<string>('AGENT_SERVER_MSG_PORT')),
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
