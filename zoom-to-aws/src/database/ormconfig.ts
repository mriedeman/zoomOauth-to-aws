//import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { TransactionLogger } from '../database-logger/database-logger.entity';
import { ConfigService } from '@nestjs/config';
// const env = process.env.NODE_ENV || 'local';
// const config = require('/Users/mattsmacbook/Documents/KPCollector/server/config/config.json')[env];

dotenv.config()

const type = process.env.DB_TYPE as 'postgres';
const host = process.env.DB_HOST;
const port = parseInt(process.env.DB_PORT || '');
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME

const dataSource = new DataSource({
    type: type, 
    host: host,
    port: port,
    username: username,
    password: password,
    database: database,
    entities: [TransactionLogger],
    synchronize: false,
    migrationsRun: false,
    logging: ['error'],
    ssl: false,
    migrations: ['dist/database/migrations/*.js'],
    migrationsTableName: 'migration_history',
})

export default dataSource;