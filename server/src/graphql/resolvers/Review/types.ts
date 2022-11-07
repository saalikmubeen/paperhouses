export interface CreateReviewInput {
    listingId: string;
    rating: number;
    comment?: string;
}

export interface CreateReviewArgs {
    input: CreateReviewInput;
}
export interface DeleteReviewInput {
    listingId: string;
    reviewId: string;
}
export interface DeleteReviewArgs {
    input: DeleteReviewInput;
}
