import { type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Drink, Review, User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

interface ReviewBody {
  drinkId?: number | string;
  rating?: number | string;
  comment?: string | null;
}

export class ReviewController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized user.", 401);
    }

    const { drinkId, rating, comment } = req.body as ReviewBody;

    const parsedDrinkId = Number(drinkId);
    if (isNaN(parsedDrinkId)) {
      throw new AppError("Valid drinkId is required.", 400);
    }

    const drink = await Drink.findByPk(parsedDrinkId);
    if (!drink) {
      throw new AppError("Drink not found.", 404);
    }

    const parsedRating = Number(rating);
    if (
      isNaN(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5 ||
      !Number.isInteger(parsedRating)
    ) {
      throw new AppError("Rating must be an integer between 1 and 5.", 400);
    }

    const review = await Review.create({
      userId,
      drinkId: parsedDrinkId,
      rating: parsedRating,
      comment: comment ? String(comment).trim() : null,
    });

    return res.status(201).json({
      message: "Review created successfully.",
      review,
    });
  }

  static async findAll(req: Request, res: Response) {
    const { page, limit, offset } = getPagination(req);
    const drinkId = req.query.drinkId ? Number(req.query.drinkId) : undefined;

    const { count, rows } = await Review.findAndCountAll({
      where: drinkId ? { drinkId } : {},
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: Drink,
          as: "drink",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
  }

  static async findById(req: Request, res: Response) {
    const id = Review.parseId(req.params.id);

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: Drink,
          as: "drink",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!review) {
      throw new AppError("Review not found.", 404);
    }

    return res.status(200).json(review);
  }

  static async update(req: Request, res: Response) {
    const id = Review.parseId(req.params.id);

    const review = await Review.findByPk(id);
    if (!review) {
      throw new AppError("Review not found.", 404);
    }

    // Apenas o próprio autor ou admin pode editar
    if (req.user?.role === "client" && review.userId !== req.user.id) {
      throw new AppError("Access denied. You can only edit your own reviews.", 403);
    }

    const { rating, comment } = req.body as ReviewBody;

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (
        isNaN(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5 ||
        !Number.isInteger(parsedRating)
      ) {
        throw new AppError("Rating must be an integer between 1 and 5.", 400);
      }
      review.rating = parsedRating;
    }

    if (comment !== undefined) {
      review.comment = comment ? String(comment).trim() : null;
    }

    await review.save();

    return res.status(200).json({
      message: "Review updated successfully.",
      review,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = Review.parseId(req.params.id);

    const review = await Review.findByPk(id);
    if (!review) {
      throw new AppError("Review not found.", 404);
    }

    // Apenas o próprio autor ou admin pode deletar
    if (req.user?.role === "client" && review.userId !== req.user.id) {
      throw new AppError("Access denied. You can only delete your own reviews.", 403);
    }

    await review.destroy();
    return res.status(200).json({ message: "Review deleted successfully." });
  }
}

export default ReviewController;
