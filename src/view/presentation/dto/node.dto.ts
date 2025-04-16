import {
  ArrayNotEmpty,
  IsArray,
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
  Breakpoints,
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

class GridContainerCreateDto extends NodeCreateDto {
  @IsInt()
  @Min(0)
  @Max(12)
  cols: number;
}

class SectionGridContainerCreateDto extends GridContainerCreateDto {
  @IsUUID()
  sectionId: string;
}

class SizeCreateDto {
  @IsInt()
  @Min(0)
  @Max(12)
  colSpan: number;
  @IsEnum(Breakpoints)
  breakpoint: Breakpoints;
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
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => SizeCreateDto)
  sizes: SizeCreateDto[];
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
