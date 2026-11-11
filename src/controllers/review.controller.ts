import { type Request, type Response } from "express";
import { Drink, Review, User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

export class ReviewController {
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized user." });
      }

      const { drinkId, rating, comment } = req.body;

      const parsedDrinkId = Number(drinkId);
      if (isNaN(parsedDrinkId)) {
        return res.status(400).json({ error: "Valid drinkId is required." });
      }

      const drink = await Drink.findByPk(parsedDrinkId);
      if (!drink) {
        return res.status(404).json({ error: "Drink not found." });
      }

      const parsedRating = Number(rating);
      if (
        isNaN(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5 ||
        !Number.isInteger(parsedRating)
      ) {
        return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
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
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
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
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid review ID." });
      }

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
        return res.status(404).json({ error: "Review not found." });
      }

      return res.status(200).json(review);
    } catch (error) {
      console.error("Error fetching review by ID:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid review ID." });
      }

      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({ error: "Review not found." });
      }

      // Apenas o próprio autor ou admin pode editar
      if (req.user?.role === "client" && review.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Access denied. You can only edit your own reviews." });
      }

      const { rating, comment } = req.body;

      if (rating !== undefined) {
        const parsedRating = Number(rating);
        if (
          isNaN(parsedRating) ||
          parsedRating < 1 ||
          parsedRating > 5 ||
          !Number.isInteger(parsedRating)
        ) {
          return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
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
    } catch (error) {
      console.error("Error updating review:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid review ID." });
      }

      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({ error: "Review not found." });
      }

      // Apenas o próprio autor ou admin pode deletar
      if (req.user?.role === "client" && review.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Access denied. You can only delete your own reviews." });
      }

      await review.destroy();
      return res.status(200).json({ message: "Review deleted successfully." });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

export default ReviewController;
