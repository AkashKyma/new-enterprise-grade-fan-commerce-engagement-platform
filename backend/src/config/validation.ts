import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, validateSync } from 'class-validator';

class EnvVars {
  @IsString() DB_HOST!: string;
  @IsInt() DB_PORT!: number;
  @IsString() DB_USER!: string;
  @IsString() DB_PASSWORD!: string;
  @IsString() DB_NAME!: string;
  @IsOptional() @IsString() REDIS_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVars, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
