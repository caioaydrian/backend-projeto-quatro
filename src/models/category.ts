import { Model } from "sequelize";

export class Category extends Model {
    declare id: number;
    declare name: string;
}

