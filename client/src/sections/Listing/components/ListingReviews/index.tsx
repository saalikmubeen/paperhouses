import { WechatOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Avatar, Button, Comment, Form, Input, List, Rate, Typography } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CREATE_REVIEW } from "../../../../lib/graphql/mutations/CreateReview";
import {
    CreateReview as CreateReviewData,
    CreateReviewVariables,
} from "../../../../lib/graphql/mutations/CreateReview/__generated__/CreateReview";
import { Listing } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import { Viewer } from "../../../../lib/types";
import { displayErrorMessage, displaySuccessNotification, iconColor } from "../../../../lib/utils";
const { TextArea } = Input;

const { Title, Text } = Typography;

interface ReviewItem {
  author: string;
  avatar: string;
  content: React.ReactNode;
  datetime: string;
}

interface Props {
    reviews: Listing["listing"]["reviews"];
    viewer: Viewer;
    refetchListing: () => Promise<void>;
    listingId: string;
}

interface EditorProps {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    submitting: boolean;
    value: string;
    ratingValue: number;
    onRatingChange: ((value: number) => void) | undefined;
}

const CommentList = ({ reviews }: { reviews: ReviewItem[] }) => (
    <List
        dataSource={reviews}
        header={
            <Title level={4}>
                <WechatOutlined />
                <br />
                ({reviews.length} {reviews.length > 1 ? "reviews" : "review"})
            </Title>
        }
        itemLayout="horizontal"
        renderItem={(props) => <Comment {...props} />}
    />
);

const Editor = ({ onChange, onSubmit, submitting, value, ratingValue, onRatingChange }: EditorProps) => (
    <>
        <Form.Item>
            <TextArea rows={4} onChange={onChange} value={value} />
        </Form.Item>

        <Form.Item>
            <Rate allowHalf value={ratingValue} onChange={onRatingChange}/>
        </Form.Item>

        <Form.Item>
            <Button
                htmlType="submit"
                loading={submitting}
                onClick={onSubmit}
                type="primary"
            >
                Add Review
            </Button>
        </Form.Item>
    </>
);

export const CreateReview: React.FC<Props> = ({reviews, viewer, refetchListing, listingId}) => {
    const [value, setValue] = useState("");
    const [ratingValue, setRatingValue] = useState(0);

    const [createReview, { loading }] = useMutation<
        CreateReviewData,
        CreateReviewVariables
    >(CREATE_REVIEW, {
        onCompleted: () => {
            displaySuccessNotification(
                "Thanks for reviewing the listing!"
            );
            refetchListing();
            setRatingValue(0);
            setValue("");
        },
        onError: (err) => {
            console.log(err.message)
            displayErrorMessage(
                err.message
            );
        },
    });

    const modifiedReviews: ReviewItem[] = reviews.map((review) => {
        return {
            avatar: review.author.avatar,
            author: review.author.name,
            content: (
                <>
                    <Rate disabled defaultValue={review.rating} />
                    <p>{review.comment}</p>
                </>
            ),
            datetime: moment(review.createdAt).fromNow()
        };
    })

    const handleSubmit = () => {
        createReview({
            variables: {
                input: {
                    rating: ratingValue,
                    comment: value,
                    listingId: listingId
                }
            }
        })
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    const handleRatingChange = (value: number) => {
        setRatingValue(value)
    };

    const alreadyReviewed = reviews.some((review) => review.author.id === viewer.id);

    return (
        <>
            {modifiedReviews.length > 0 && (
                <CommentList reviews={modifiedReviews} />
            )}

            {viewer.id && !alreadyReviewed ? (
                <Comment
                    avatar={<Avatar src={viewer.avatar} alt={viewer.id} />}
                    content={
                        <Editor
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            submitting={loading}
                            value={value}
                            onRatingChange={handleRatingChange}
                            ratingValue={ratingValue}
                        />
                    }
                />
            ) : (
                <Text type="secondary" mark>
                    You have already rated this listing!
                </Text>
            )}
        </>
    );
};