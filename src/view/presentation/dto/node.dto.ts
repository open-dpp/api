import {
  IsEnum,
  IsInt,
  IsNotEmptyObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
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
import { Type } from 'class-transformer';

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
