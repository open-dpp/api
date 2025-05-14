import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ResponsiveConfigDto {
  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  xs?: number;
  @IsInt()
  @Min(0)
  @Max(12)
  sm: number;
  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  md?: number;
  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  lg?: number;
  @IsInt()
  @Min(0)
  @Max(12)
  @IsOptional()
  xl?: number;
}

export class LayoutDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  colStart: ResponsiveConfigDto;
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  colSpan: ResponsiveConfigDto;
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  rowStart: ResponsiveConfigDto;
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  rowSpan: ResponsiveConfigDto;
}

export class SectionLayout extends LayoutDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  cols: ResponsiveConfigDto;
}
