import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AuthService } from '../../src/auth/auth.service';
import { RegisterDto } from '../../src/auth/dtos/register.dto';
import {
  ReservationInput,
  ReservationUpdateInput,
} from '../../src/reservation/dtos/reservation-input.dto';
import { ReservationStatus } from '../../src/reservation/entities/reservation.entity';
import { ReservationModule } from '../../src/reservation/reservation.module';
import { UserModule } from '../../src/user/user.module';
import {
  User,
  UserDocument,
  UserRole,
  UserSchema,
} from '../../src/user/user.schema';

describe('ReservationResolver (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let authService: AuthService;
  let jwtService: JwtService;
  let guestToken: string;
  let staffToken: string;
  let guestUserId: string;
  let staffUserId: string;
  let reservationId: string;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          path: '/reservation',
          include: [ReservationModule],
          autoSchemaFile: true,
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
        ReservationModule,
        UserModule,
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(User.name),
    );

    await app.init();

    // Create a test guest user and generate a JWT token
    const guestRegisterDto: RegisterDto = {
      email: 'testuser@example.com',
      phone: '+1234567890',
      password: 'testpassword',
    };

    const guestUser = await authService.register(guestRegisterDto);
    guestToken = jwtService.sign({
      userId: guestUser.userId,
      role: guestUser.role,
    });
    guestUserId = guestUser.userId;

    // Create a test staff user and generate a JWT token
    const staffRegisterDto: RegisterDto = {
      email: 'staffuser@example.com',
      phone: '+0987654321',
      password: 'staffpassword',
    };

    const staffUser = await authService.register(staffRegisterDto);
    await userModel.updateOne(
      { _id: staffUser.userId },
      { role: UserRole.STAFF },
    );
    staffToken = jwtService.sign({
      userId: staffUser.userId,
      role: UserRole.STAFF,
    });
    staffUserId = staffUser.userId;
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });

  describe('createReservation', () => {
    it('should create a new reservation for a guest', async () => {
      const reservationInput: ReservationInput = {
        guestName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        arrivalTime: new Date().toISOString(),
        tableSize: 4,
      };

      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: { input: reservationInput },
          query: `
            mutation CreateReservation($input: ReservationInput!) {
              createReservation(input: $input) {
                id
                guestName
                email
                phone
                arrivalTime
                tableSize
                status
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.createReservation).toMatchObject({
        guestName: reservationInput.guestName,
        email: reservationInput.email,
        phone: reservationInput.phone,
        arrivalTime: reservationInput.arrivalTime,
        tableSize: reservationInput.tableSize,
        status: ReservationStatus.REQUESTED,
        user: { id: guestUserId },
      });

      reservationId = response.body.data.createReservation.id;
    });
  });

  describe('findMyReservations', () => {
    it('should return a list of reservations for the authenticated guest user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: {},
          query: `
            query MyReservations {
              myReservations {
                items {
                  id
                  guestName
                  email
                  phone
                  arrivalTime
                  tableSize
                  status
                  user {
                    id
                  }
                }
                pageInfo {
                  totalItems
                  currentPage
                  itemsPerPage
                  totalPages
                  hasNextPage
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.myReservations.items).toBeInstanceOf(Array);
      expect(response.body.data.myReservations.items.length).toBeGreaterThan(0);
    });
  });

  describe('reservations', () => {
    it('should return a list of reservations for a staff user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          operationName: null,
          variables: {},
          query: `
            query Reservations {
              reservations {
                items {
                  id
                  guestName
                  email
                  phone
                  arrivalTime
                  tableSize
                  status
                  user {
                    id
                  }
                }
                pageInfo {
                  totalItems
                  currentPage
                  itemsPerPage
                  totalPages
                  hasNextPage
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.reservations.items).toBeInstanceOf(Array);
      expect(response.body.data.reservations.items.length).toBeGreaterThan(0);
    });
  });

  describe('updateReservation', () => {
    it('should update an existing reservation for a guest', async () => {
      const reservationUpdateInput: ReservationUpdateInput = {
        guestName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+0987654321',
        arrivalTime: new Date().toISOString(),
        tableSize: 2,
      };

      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: { id: reservationId, input: reservationUpdateInput },
          query: `
            mutation UpdateReservation($id: ID!, $input: ReservationUpdateInput!) {
              updateReservation(id: $id, input: $input) {
                id
                guestName
                email
                phone
                arrivalTime
                tableSize
                status
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.updateReservation).toMatchObject({
        guestName: reservationUpdateInput.guestName,
        email: reservationUpdateInput.email,
        phone: reservationUpdateInput.phone,
        arrivalTime: reservationUpdateInput.arrivalTime,
        tableSize: reservationUpdateInput.tableSize,
        status: ReservationStatus.REQUESTED,
        user: { id: guestUserId },
      });
    });
  });

  describe('cancelReservation', () => {
    it('should cancel an existing reservation for a guest', async () => {
      const reason = 'No longer needed';

      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: { id: reservationId, reason },
          query: `
            mutation CancelReservation($id: ID!, $reason: String!) {
              cancelReservation(id: $id, reason: $reason) {
                id
                guestName
                email
                phone
                arrivalTime
                tableSize
                status
                cancellationReason
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.cancelReservation).toMatchObject({
        status: ReservationStatus.CANCELLED,
        cancellationReason: reason,
        user: { id: guestUserId },
      });
    });
  });

  describe('approveReservation', () => {
    let newReservationId: string;

    beforeAll(async () => {
      const reservationInput: ReservationInput = {
        guestName: 'Alice Smith',
        email: 'alice.smith@example.com',
        phone: '+1112223334',
        arrivalTime: new Date().toISOString(),
        tableSize: 3,
      };

      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: { input: reservationInput },
          query: `
            mutation CreateReservation($input: ReservationInput!) {
              createReservation(input: $input) {
                id
              }
            }
          `,
        })
        .expect(200);

      newReservationId = response.body.data.createReservation.id;
    });

    it('should approve an existing reservation for a staff user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          operationName: null,
          variables: { id: newReservationId },
          query: `
            mutation ApproveReservation($id: ID!) {
              approveReservation(id: $id) {
                id
                guestName
                email
                phone
                arrivalTime
                tableSize
                status
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.approveReservation).toMatchObject({
        status: ReservationStatus.APPROVED,
        user: { id: guestUserId },
      });
    });
  });

  describe('completeReservation', () => {
    let approvedReservationId: string;

    beforeAll(async () => {
      const reservationInput: ReservationInput = {
        guestName: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+4445556667',
        arrivalTime: new Date().toISOString(),
        tableSize: 2,
      };

      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: { input: reservationInput },
          query: `
            mutation CreateReservation($input: ReservationInput!) {
              createReservation(input: $input) {
                id
              }
            }
          `,
        })
        .expect(200);

      approvedReservationId = response.body.data.createReservation.id;

      // Approve the reservation
      await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          operationName: null,
          variables: { id: approvedReservationId },
          query: `
            mutation ApproveReservation($id: ID!) {
              approveReservation(id: $id) {
                id
              }
            }
          `,
        })
        .expect(200);
    });

    it('should complete an existing reservation for a staff user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          operationName: null,
          variables: { id: approvedReservationId },
          query: `
            mutation CompleteReservation($id: ID!) {
              completeReservation(id: $id) {
                id
                guestName
                email
                phone
                arrivalTime
                tableSize
                status
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.completeReservation).toMatchObject({
        status: ReservationStatus.COMPLETED,
        user: { id: guestUserId },
      });
    });
  });

  describe('me', () => {
    it('should return the authenticated guest user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          operationName: null,
          variables: {},
          query: `
            query Me {
              me {
                id
                email
                phone
                role
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.me).toMatchObject({
        id: guestUserId,
        email: 'testuser@example.com',
        phone: '+1234567890',
        role: 'guest',
      });
    });

    it('should return the authenticated staff user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          operationName: null,
          variables: {},
          query: `
            query Me {
              me {
                id
                email
                phone
                role
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.me).toMatchObject({
        id: staffUserId,
        email: 'staffuser@example.com',
        phone: '+0987654321',
        role: 'staff',
      });
    });
  });
});
