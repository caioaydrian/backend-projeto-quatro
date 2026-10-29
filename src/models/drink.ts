import { ForeignKey, Model } from "sequelize";
import { Category } from "./category.js";

export class Drink extends Model {
    declare id: number;
    declare name: string;
    declare price: number;
    declare stock: number;
    declare categoryId: ForeignKey<Category["id"]>;
}