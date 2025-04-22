import {
  IsEnum,
  IsInt,
  IsNotEmptyObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
  validateSync,
  ValidationError,
} from 'class-validator';
import {
  DataFieldRef,
  GridContainer,
  GridItem,
  NodeType,
  SectionGrid,
} from '../../domain/node';
import { omit } from 'lodash';
import { ValueError } from '../../../exceptions/domain.errors';
import { plainToInstance, Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class NodeCreateDto {
  @IsEnum(NodeType)
  type: NodeType;
}

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

class GridContainerCreateDto extends NodeCreateDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  cols: ResponsiveConfigDto;
}

class SectionGridContainerCreateDto extends GridContainerCreateDto {
  @IsUUID()
  sectionId: string;
}

class DataFieldRefCreateDto extends NodeCreateDto {
  @IsUUID()
  fieldId: string;
}

const nodeCreateSubtypesWithoutGridItem = [
  { value: GridContainerCreateDto, name: NodeType.GRID_CONTAINER },
  { value: DataFieldRefCreateDto, name: NodeType.DATA_FIELD_REF },
  { value: SectionGridContainerCreateDto, name: NodeType.SECTION_GRID },
];

class GridItemCreateDto extends NodeCreateDto {
  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  colSpan: ResponsiveConfigDto;

  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  colStart?: ResponsiveConfigDto;

  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  rowStart?: ResponsiveConfigDto;

  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  rowSpan?: ResponsiveConfigDto;

  @IsInt()
  @IsOptional()
  initNumberOfChildren?: number;

  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => NodeCreateDto, {
    discriminator: {
      property: 'type',
      subTypes: nodeCreateSubtypesWithoutGridItem,
    },
    keepDiscriminatorProperty: true,
  })
  @IsOptional()
  content?: NodeCreateDto;
}

const nodeCreateSubtypes = [
  ...nodeCreateSubtypesWithoutGridItem,
  { value: GridItemCreateDto, name: NodeType.GRID_ITEM },
];

export class AddNodeDto {
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => NodeCreateDto, {
    discriminator: {
      property: 'type',
      subTypes: nodeCreateSubtypes,
    },
    keepDiscriminatorProperty: true,
  })
  node: NodeCreateDto;
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

function isGridContainerCreateDto(
  node: NodeCreateDto,
): node is GridContainerCreateDto {
  return node.type === NodeType.GRID_CONTAINER;
}

function isSectionGridContainerCreateDto(
  node: NodeCreateDto,
): node is SectionGridContainerCreateDto {
  return node.type === NodeType.SECTION_GRID;
}

function isGridItemCreateDto(node: NodeCreateDto): node is GridItemCreateDto {
  return node.type === NodeType.GRID_ITEM;
}

function isDataFieldRefCreateDto(
  node: NodeCreateDto,
): node is DataFieldRefCreateDto {
  return node.type === NodeType.DATA_FIELD_REF;
}

export function nodeFromDto(createDto: NodeCreateDto) {
  const ignoreType = 'type';
  if (isGridContainerCreateDto(createDto)) {
    return GridContainer.create({ ...omit(createDto, ignoreType) });
  }
  if (isSectionGridContainerCreateDto(createDto)) {
    return SectionGrid.create({ ...omit(createDto, ignoreType) });
  }
  if (isGridItemCreateDto(createDto)) {
    const node = createDto.content ? nodeFromDto(createDto.content) : undefined;
    return GridItem.create({ ...omit(createDto, ignoreType), content: node });
  }
  if (isDataFieldRefCreateDto(createDto)) {
    return DataFieldRef.create({ ...omit(createDto, ignoreType) });
  }
  throw new ValueError(`Type ${createDto.type} not supported`);
}

// ----------------------

export class NodeUpdateDto {
  type: NodeType;
}

export class GridContainerUpdateDto extends NodeUpdateDto {
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ResponsiveConfigDto)
  cols: ResponsiveConfigDto;
}

export class GridItemUpdateDto extends NodeUpdateDto {
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ResponsiveConfigDto)
  colSpan: ResponsiveConfigDto;

  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  colStart?: ResponsiveConfigDto;

  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  rowStart?: ResponsiveConfigDto;

  @ValidateNested()
  @Type(() => ResponsiveConfigDto)
  @IsOptional()
  rowSpan?: ResponsiveConfigDto;
}

const nodeUpdateSubtypes: {
  name: NodeType;
  value: new (...args: any[]) => any;
}[] = [
  { value: GridContainerUpdateDto, name: NodeType.GRID_CONTAINER },
  { value: GridItemUpdateDto, name: NodeType.GRID_ITEM },
];

export function plainToUpdateDto(nodeType: string, plain: any) {
  const found = nodeUpdateSubtypes.find((n) => n.name === nodeType);
  if (found) {
    return plainToInstance(found.value, { ...plain, type: nodeType });
  } else {
    throw new BadRequestException(`Node type ${nodeType} not supported`);
  }
}

function formatErrors(errors: ValidationError[]): any[] {
  return errors.map((error) => {
    const formatted: any = {
      property: error.property,
      constraints: error.constraints,
    };

    if (error.children && error.children.length > 0) {
      formatted.children = formatErrors(error.children);
    }

    return formatted;
  });
}

export function validateUpdateDtoOrFail(nodeUpdateDto: NodeUpdateDto) {
  const errors = validateSync(nodeUpdateDto);
  if (errors.length > 0) {
    throw new BadRequestException({ errors: formatErrors(errors) });
  }
}

export function isGridContainerUpdateDto(
  node: NodeUpdateDto,
): node is GridContainerUpdateDto {
  return node.type === NodeType.GRID_CONTAINER;
}

export function isGridItemUpdateDto(
  node: NodeUpdateDto,
): node is GridItemUpdateDto {
  return node.type === NodeType.GRID_ITEM;
}
