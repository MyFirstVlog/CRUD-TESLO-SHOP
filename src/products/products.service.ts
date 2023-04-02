import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid'
import { log } from 'console';
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto): Promise<Product> {
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

  async findAll(paginationDto: PaginationDto): Promise<Product[]>{
    try {

      const {limit, offset} = paginationDto;

      return await this.productRepository.find({
        take: limit,
        skip: offset
      });

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(term: string): Promise<Product>{
    try {
      let product: Product;
      if(isUUID(term)){
        product = await this.productRepository.findOneBy({id: term});
      }else{
        // product = await this.productRepository.findOneBy({slug: term});
        const queryBulder = this.productRepository.createQueryBuilder();
        product = await queryBulder
          .where('UPPER(title) =:title or slug =:slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase()
          }).getOne();
      }

      if(!product) throw new NotFoundException(`The product with term ${term} not found !!!`);

      return product;
    } catch (error) {
      
      this.handleExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto){

    try {

      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });

      if(!product) throw new NotFoundException(`product with id: ${id}, not found`);

      await this.productRepository.save(product);

      return product;
    
    } catch (error) {
      
      this.handleExceptions(error);

    }
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
    console.log({error}, error);
    const {detail, response} = !!error && error;
    if(error.code === '23505' || !String(error.status).includes('5'))
        throw new BadRequestException(detail || response);
      
    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  } 
}
