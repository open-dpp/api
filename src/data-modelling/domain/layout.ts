import { ValueError } from '../../exceptions/domain.errors';
import { z } from 'zod/v4';

export const ResponsiveConfigSchema = z.object({
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
  private constructor(
    public colStart: ResponsiveConfig,
    public colSpan: ResponsiveConfig,
    public rowStart: ResponsiveConfig,
    public rowSpan: ResponsiveConfig,
    public cols?: ResponsiveConfig,
  ) {}

  static create(data: LayoutProps) {
    Layout.validateLayoutProps(data);
    return new Layout(
      data.colStart,
      data.colSpan,
      data.rowStart,
      data.rowSpan,
      data.cols,
    );
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

  modify(plain: Partial<LayoutProps>) {
    Layout.validateLayoutProps(plain);
    this.colSpan = plain.colSpan ?? this.colSpan;
    this.colStart = plain.colStart ?? this.colStart;
    this.rowStart = plain.rowStart ?? this.rowStart;
    this.rowSpan = plain.rowSpan ?? this.rowSpan;
    this.cols = plain.cols ?? this.cols;
  }
}
