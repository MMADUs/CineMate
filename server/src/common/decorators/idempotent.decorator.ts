import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_METADATA_KEY = 'isIdempotent';

export const Idempotent = () => SetMetadata(IDEMPOTENT_METADATA_KEY, true);
