import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly  productService :ProductsService, 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async runSeed(){
    try {
      await this.deleteAllTables();
      const user = await this.insertUsers();
      await this.insertNewProduct(user);
    } catch (error) {
      console.log({error});
    }
    return 'SEED EXECUTED';
  }
  
  private async insertUsers() {
    const {users} = initialData;

    const userArray: User[] = []; 

    users.forEach(user => {
      user.password = bcrypt.hashSync(user.password, 10);
      userArray.push(this.userRepository.create(user))
    });

    await this.userRepository.save(userArray);

    return userArray[0];
  }

  private async deleteAllTables(){

    await this.productService.deleteAllProducts();

    const userQueryBuilder = this.userRepository.createQueryBuilder();

    await userQueryBuilder.delete().where({}).execute();
  }

  private async insertNewProduct (user: User) {
    this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => insertPromises.push(this.productService.create(product, user)));

    await Promise.all(insertPromises);
    
    return true

  }
}