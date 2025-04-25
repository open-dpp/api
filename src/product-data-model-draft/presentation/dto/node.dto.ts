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
  @IsOptional()
  sm?: number;
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

export class NodeDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  colStart: ResponsiveConfigDto;
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  colSpan: ResponsiveConfigDto;
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  rowStart?: ResponsiveConfigDto;
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  rowSpan?: ResponsiveConfigDto;
}

export class CreateSectionGridDto extends NodeDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  cols: ResponsiveConfigDto;
}

export class CreateDataFieldRefDto extends NodeDto {}

export class UpdateSectionGridDto extends NodeDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  cols: ResponsiveConfigDto;
}

export class UpdateDataFieldRefDto extends NodeDto {}
