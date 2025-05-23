import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from './reservation/reservation.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(getMongoDbUri(), {
      autoIndex: false,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/reservation',
      include: [ReservationModule],
      autoSchemaFile: true,
      // TODO: 生产环境关闭 playground
      playground: true,
      context: ({ req }) => ({ req }),
      formatError: (err) => {
        console.log(`GraphQL Error ${err.message}`);
        return err;
      },
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
      global: true,
    }),
    AuthModule,
    UserModule,
    ReservationModule,
  ],
})
export class AppModule {}

function getMongoDbUri(): string {
  const mongoDbUri = process.env.MONGODB_URI;
  if (!mongoDbUri) {
    throw new Error('MONGODB_URI 环境变量未设置');
  }
  return mongoDbUri;
}
