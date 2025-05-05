import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { ValueError } from '../../exceptions/domain.errors';
import { z } from 'zod';

const ResponsiveConfigSchema = z.object({
  xs: z.number().int().min(1).max(12).optional(),
  sm: z.number().int().min(1).max(12),
  md: z.number().int().min(1).max(12).optional(),
  lg: z.number().int().min(1).max(12).optional(),
  xl: z.number().int().min(1).max(12).optional(),
});

export type ResponsiveConfig = z.infer<typeof ResponsiveConfigSchema>;

function validateResponseConfig(config: ResponsiveConfig, errorPrefix: string) {
  if (!ResponsiveConfigSchema.safeParse(config).success) {
    throw new ValueError(`${errorPrefix} has to be an integer between 1 or 12`);
  }
}

export type LayoutProps = {
  colStart: ResponsiveConfig;
  colSpan: ResponsiveConfig;
  rowSpan: ResponsiveConfig;
  rowStart: ResponsiveConfig;
  cols?: ResponsiveConfig;
};

export class Layout {
  @Expose()
  cols?: ResponsiveConfig;
  @Expose()
  public colStart: ResponsiveConfig;
  @Expose()
  public colSpan: ResponsiveConfig;
  @Expose()
  public rowStart: ResponsiveConfig;
  @Expose()
  public rowSpan: ResponsiveConfig;
  static create(plain: LayoutProps) {
    Layout.validateLayoutProps(plain);
    return Layout.fromPlain(plain);
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(Layout, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  static validateLayoutProps(plain: Partial<LayoutProps>) {
    if (plain.colStart) {
      validateResponseConfig(plain.colStart, 'colStart');
    }
    if (plain.colSpan) {
      validateResponseConfig(plain.colSpan, 'colSpan');
    }
    if (plain.rowStart) {
      validateResponseConfig(plain.rowStart, 'rowStart');
    }
    if (plain.rowSpan) {
      validateResponseConfig(plain.rowSpan, 'rowSpan');
    }
  }

  toPlain() {
    return instanceToPlain(this);
  }

  modify(plain: Partial<LayoutProps>) {
    Layout.validateLayoutProps(plain);
    this.colSpan = plain.colSpan ?? this.colSpan;
    this.colStart = plain.colStart ?? this.colStart;
    this.rowStart = plain.rowStart ?? this.rowStart;
    this.rowSpan = plain.rowSpan ?? this.rowSpan;
    this.cols = plain.cols ?? this.cols;
  }
}
