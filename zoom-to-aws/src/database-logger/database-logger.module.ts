import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "src/auth/auth.service";
import { TransactionLogger } from "./database-logger.entity";
import { DatabaseLoggerService } from "./database-logger.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLogger]),
            AuthModule],
  providers: [DatabaseLoggerService],
  controllers: [],
  exports: [DatabaseLoggerService]
})
export class TransactionLoggerModule {}