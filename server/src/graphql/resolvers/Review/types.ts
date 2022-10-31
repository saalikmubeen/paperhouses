export interface CreateReviewInput {
    listingId: string;
    rating: number;
    comment?: string;
}

export interface CreateReviewArgs {
    input: CreateReviewInput;
}
