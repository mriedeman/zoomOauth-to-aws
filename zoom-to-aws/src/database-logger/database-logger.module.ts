import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "src/auth/auth.service";
import { TransactionLogger } from "./database-logger.entity";
import { DatabaseLoggerService } from "./database-logger.service";

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLogger])],
  providers: [DatabaseLoggerService, AuthService],
  controllers: [],
  exports: [DatabaseLoggerService, TransactionLogger]
})
export class TransactionLoggerModule {}