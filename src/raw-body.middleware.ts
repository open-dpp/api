import { RawBodyRequest } from '@nestjs/common';
import * as express from 'express';
import { Request, Response } from 'express';

export interface RawBodyMiddlewareOptions {
  limit: string;
  rawBodyUrls: string[];
}

export function rawBodyMiddleware(options: RawBodyMiddlewareOptions): unknown {
  const rawBodyUrls = new Set(options.rawBodyUrls);

  return express.json({
    ...options,
    verify: (request: RawBodyRequest<Request>, _: Response, buffer: Buffer) => {
      if (rawBodyUrls.has(request.url) && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }
      return true;
    },
  });
}
