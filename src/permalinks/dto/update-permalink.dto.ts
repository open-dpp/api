import {PartialType} from '@nestjs/mapped-types';
import {CreatePermalinkDto} from './create-permalink.dto';

export class UpdatePermalinkDto extends PartialType(CreatePermalinkDto) {

}
