import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassThrough } from 'stream';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      // if(!createProductDto.slug){
      //   createProductDto.slug = createProductDto.title
      //     .toLowerCase()
      //     .replaceAll(" ", "_")
      //     .replaceAll("'", "");
      // }else{
      //   createProductDto.slug = createProductDto.slug
      //     .toLowerCase()
      //     .replaceAll(" ", "_")
      //     .replaceAll("'", "");
      // }

      const product  = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(): Promise<Product[]>{
    try {
      return await this.productRepository.find({});
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productRepository.findOneBy({id});

      if(!product) throw new NotFoundException(`The product with id ${id} not found !!!`);

      return product;
    } catch (error) {
      
      this.handleExceptions(error);
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) { 
    try {
      const product = await this.findOne(id);

      await this.productRepository.remove(product);

      return product

    } catch (error) {
      
      this.handleExceptions(error);
    }
  }

  private handleExceptions( error: any){
    if(error.code === '23505')
        throw new BadRequestException(error.detail);
      
      this.logger.error(error);
      throw new InternalServerErrorException("Unexpected error, check server logs");
  } 
}
