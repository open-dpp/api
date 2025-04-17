import { DrawflowHomeData } from './DrawflowHomeData';
import { Expose } from 'class-transformer';

export abstract class DrawflowInfo {
  @Expose()
  drawflow: {
    Home: DrawflowHomeData;
  };
}
