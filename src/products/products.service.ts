import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage} from './entities';
import { validate as isUUID } from 'uuid'
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ){}

  plainImagesUrls(products: Product[]){
    return products.map(product => {
      return {
        ...product,
        images: product.images.map(image => image.url)
      }
    });
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const {images: imageUrls = [], ...productDetails} = createProductDto;

      const product  = this.productRepository.create({
        ...productDetails,
        images: imageUrls.map(image => this.productImageRepository.create({url: image}))
      });

      await this.productRepository.save(product);

      return { ...product, images: imageUrls};
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto){
    try {

      const {limit, offset} = paginationDto;

      let products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });

      return this.plainImagesUrls(products);

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(term: string){
    try {
      let product: Product;
      if(isUUID(term)){
        product = await this.productRepository.findOneBy({id: term});
      }else{
        // product = await this.productRepository.findOneBy({slug: term});
        const queryBulder = this.productRepository.createQueryBuilder("prod");
        product = await queryBulder
          .where('UPPER(title) =:title or slug =:slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase()
          })
          .leftJoinAndSelect("prod.images", "prodImages") //? "prodImages" In case we need more joins down
          .getOne();
      }

      if(!product) throw new NotFoundException(`The product with term ${term} not found !!!`);

      return product;
    } catch (error) {
      
      this.handleExceptions(error);
    }
  }

  async findOnePlained(term: string){
    const product = await this.findOne(term);

    return this.plainImagesUrls([product]);
  }

  async update(id: string, updateProductDto: UpdateProductDto){

    try {

      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
        images: []
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
