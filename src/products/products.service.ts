import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage} from './entities';
import { User } from '../auth/entities/users.entity';
import { validate as isUUID } from 'uuid'
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, 
  ){}

  plainImagesUrls(products: Product[]){
    return products.map(product => {
      return {
        ...product,
        images: product.images.map(image => image.url)
      }
    });
  }

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const {images: imageUrls = [], ...productDetails} = createProductDto;

      const product  = this.productRepository.create({
        ...productDetails,
        images: imageUrls.map(image => this.productImageRepository.create({url: image})),// The await resolving down is also waiting for that inner promise of prod images creation,
        user
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
          .innerJoinAndSelect("prod.images", "prodImages") //? "prodImages" alias del imafes, In case we need more joins down
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

  async update(id: string, updateProductDto: UpdateProductDto, user: User){
    const queryRunner = this.dataSource.createQueryRunner();
    try {

      const {images, ...toUpdate} = updateProductDto;

      const product = await this.productRepository.preload({
        id: id,
        ...toUpdate,
      });

      if(!product) throw new NotFoundException(`product with id: ${id}, not found`);

      //Create query runner if there are images
      await queryRunner.connect();
      await queryRunner.startTransaction();
      if(images) {
        await queryRunner.manager.delete( ProductImage, {product: { id }});
        product.images = images.map(image => 
          this.productImageRepository.create({url: image})
        );
      }
      product.user = user;
      // await this.productRepository.save(product);
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlained(id);
    } catch (error) {
      queryRunner.rollbackTransaction();
      queryRunner.release();
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

  async deleteAllProducts() {
     const queryBuilder = this.productRepository.createQueryBuilder('product');
     try {
        return await queryBuilder.delete().where({}).execute();
     } catch (error) {
      this.handleExceptions(error);
     }
  }
}
