import {Injectable} from '@nestjs/common';
import {CreateProductDto} from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import {Product} from "./entities/product.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {
    }

    create(createProductDto: CreateProductDto) {
        return this.productRepository.save({
            name: createProductDto.name,
            description: createProductDto.description,
        });
    }

    findAll() {
        return this.productRepository.find({
            relations: {
                permalinks: true,
            }
        });
    }

    findOne(id: string) {
        return this.productRepository.findOne({
            where: {id},
            relations: {
                permalinks: true,
            }
        })
    }

    update(id: string, updateProductDto: UpdateProductDto) {
        return this.productRepository.update(id, {
            name: updateProductDto.name,
            description: updateProductDto.description,
        });
    }

    remove(id: string) {
        return this.productRepository.delete(id);
    }
}
