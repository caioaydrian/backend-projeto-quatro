import { Model } from "sequelize";

export class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: string;
}
