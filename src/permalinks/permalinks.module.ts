import {Module} from '@nestjs/common';
import {PermalinksService} from './permalinks.service';
import {PermalinksController} from './permalinks.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Permalink} from "./entities/permalink.entity";
import {ProductsModule} from "../products/products.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Permalink]),
        ProductsModule
    ],
    controllers: [PermalinksController],
    providers: [PermalinksService],
    exports: [PermalinksService]
})
export class PermalinksModule {
}
