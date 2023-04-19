import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly  productService :ProductsService, 
  ){}

  async runSeed(){
    try {
      await this.insertNewProduct();
    } catch (error) {
      console.log({error});
    }
    return 'SEED EXECUTED';
  }

  private async insertNewProduct () {
    this.productService.deleteAllProducts();
  }
}
