import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

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

    const products = initialData.products;

    const insertPromises = [];

    // products.forEach( product => insertPromises.push(this.productService.create(product)));

    await Promise.all(insertPromises);
    
    return true

  }
}