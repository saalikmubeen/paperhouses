import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";

import { Database, Review, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateReviewArgs, DeleteReviewArgs } from "./types";

export const reviewResolvers: IResolvers = {
    Mutation: {
        createReview: async (
            _root: undefined,
            { input }: CreateReviewArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Review> => {
            try {
                const viewer = await authorize(db, req);

                if (!viewer) {
                    throw new Error("viewer cannot be found | unauthorized");
                }

                let listing = await db.listings.findOne({
                    _id: new ObjectId(input.listingId),
                });

                if (!listing) {
                    throw new Error("Listing not found!");
                }

                const alreadyReviewed = listing.reviews.some(
                    (review) =>
                        review.author.toString() === viewer._id.toString()
                );

                if (alreadyReviewed) {
                    throw new Error("You have already reviewed this listing!");
                }

                if (input.rating < 0 || input.rating > 5) {
                    throw new Error("Provide a rating between 0 and 5!");
                }

                const review: Review = {
                    _id: new ObjectId(),
                    createdAt: new Date().toISOString(),
                    rating: input.rating,
                    comment: input.comment,
                    author: viewer._id,
                };

                const updatedTotalReviews = [...listing.reviews, review];

                const numReviews = updatedTotalReviews.length;

                const avgRating =
                    updatedTotalReviews.reduce(
                        (acc, next) => acc + next.rating,
                        0
                    ) / numReviews;

                await db.listings.updateOne(
                    {
                        _id: listing._id,
                    },
                    {
                        $set: {
                            numReviews: numReviews,
                            rating: avgRating,
                        },
                        $push: { reviews: review },
                    }
                );

                return review;
            } catch (error) {
                throw new Error(`${error}`);
            }
        },

        deleteReview: async (
            _root: undefined,
            { input }: DeleteReviewArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Review> => {
            try {
                const viewer = await authorize(db, req);

                if (!viewer) {
                    throw new Error("viewer cannot be found | unauthorized");
                }

                let listing = await db.listings.findOne({
                    _id: new ObjectId(input.listingId),
                });

                if (!listing) {
                    throw new Error("Listing not found!");
                }

                const reviewToDelete = listing.reviews.find((review) => {
                    return review._id.toString() === input.reviewId
                })

                if(!reviewToDelete) {
                    throw new Error("Review not found!");
                }

                const isAuthorizedToDelete = reviewToDelete.author === viewer._id;

                if (!isAuthorizedToDelete) {
                    throw new Error("Unauthorized!");
                }
                
                // reviews after deleting the requested review
                const updatedTotalReviews = listing.reviews.filter((review) => {
                    return review._id.toString() !== input.reviewId
                });

                const numReviews = updatedTotalReviews.length;

                let avgRating;

                if(numReviews === 0) {
                    avgRating = 0;
                } else {
                    avgRating = updatedTotalReviews.reduce(
                        (acc, next) => acc + next.rating,
                        0
                    ) / numReviews;
                }

                await db.listings.updateOne(
                    {
                        _id: listing._id,
                    },
                    {
                        $set: {
                            numReviews: numReviews,
                            rating: avgRating,
                            reviews: updatedTotalReviews
                        },
                    }
                );

                return reviewToDelete;
            } catch (error) {
                throw new Error(`${error}`);
            }
        },

    },

    Review: {
        id: (review: Review): string => {
            return review._id.toString();
        },

        author: async (
            review: Review,
            _args: {},
            { db }: { db: Database }
        ): Promise<User> => {
            const author = await db.users.findOne({ _id: review.author });
            if (!author) {
                throw new Error("User can't be found");
            }
            return author;
        },
    },
};
