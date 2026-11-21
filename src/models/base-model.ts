import { Model } from "sequelize";
import { BadRequestError } from "../errors/AppError.js";

export abstract class BaseModel extends Model {
  declare public id: number;
  protected static resourceName = "resource";

  public static parseId(value: unknown): number {
    const id = Number(value);
    if (isNaN(id)) {
      throw new BadRequestError(`Invalid ${this.resourceName} ID.`);
    }
    return id;
  }

  public toSafeObject(): Record<string, unknown> {
    return this.toJSON() as Record<string, unknown>;
  }
}

export default BaseModel;
