import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';
import { GetUser } from '../auth/decorators/custom-decorators.decorator';
import { User } from '../auth/entities/users.entity';

@Controller('products')
// @Auth(ValidRoles.superUser)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(ValidRoles.superUser)
  create(
      @Body() createProductDto: CreateProductDto,
      @GetUser() user: User
    ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto :PaginationDto) {

    return this.productsService.findAll(paginationDto);
  }

  @Get('/plained/:term')
  findOnePlained(@Param('term') term: string) {
    return this.productsService.findOnePlained(term);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.superUser)
  update(
    @Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
