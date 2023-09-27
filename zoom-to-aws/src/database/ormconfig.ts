//import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { TransactionLogger } from '../database-logger/database-logger.entity';
import { ConfigService } from '@nestjs/config';
// const env = process.env.NODE_ENV || 'local';
// const config = require('/Users/mattsmacbook/Documents/KPCollector/server/config/config.json')[env];



//dotenv.config()


//localhost
const configService = new ConfigService();



configService.get<string>('DB_TYPE')
const dataSource = new DataSource({
    type: configService.get<string>('DB_TYPE') as 'postgres', 
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [TransactionLogger],
    synchronize: false,
    migrationsRun: false,
    logging: ['error'],
    ssl: false,
    migrations: ['dist/database/migrations/*.js'],
    migrationsTableName: 'migration_history',
})