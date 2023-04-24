import { IsUrl } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./";



@Entity({name: 'porduct_images'})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: string;

    @Column('text')
    @IsUrl()
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        {onDelete: 'CASCADE' }
    )
    product: Product

}