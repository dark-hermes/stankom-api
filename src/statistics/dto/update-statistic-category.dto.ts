import { PartialType } from '@nestjs/swagger';
import { CreateStatisticCategoryDto } from './create-statistic-category.dto';

export class UpdateStatisticCategoryDto extends PartialType(
  CreateStatisticCategoryDto,
) {}
