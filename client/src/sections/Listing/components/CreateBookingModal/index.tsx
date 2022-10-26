import React from "react";
import { useMutation } from "@apollo/client";
// import {
//     CardElement,
//     injectStripe,
//     ReactStripeElements,
// } from "react-stripe-elements";
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { Button, Divider, Modal, Typography } from "antd";
import  {
    KeyOutlined
} from "@ant-design/icons";
import moment, { Moment } from "moment";
import { CREATE_BOOKING } from "../../../../lib/graphql/mutations";
import {
    CreateBooking as CreateBookingData,
    CreateBookingVariables,
} from "../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking";
import {
    formatListingPrice,
    displaySuccessNotification,
    displayErrorMessage,
} from "../../../../lib/utils";

interface Props {
    listingId: string;
    price: number;
    modalVisible: boolean;
    checkInDate: Moment;
    checkOutDate: Moment;
    setModalVisible: (modalVisible: boolean) => void;
    clearBookingData: () => void;
    refetchListing: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const CreateBookingModal = ({
    listingId,
    price,
    modalVisible,
    checkInDate,
    checkOutDate,
    setModalVisible,
    clearBookingData,
    refetchListing,
}: Props) => {
    const [createBooking, { loading }] = useMutation<
        CreateBookingData,
        CreateBookingVariables
    >(CREATE_BOOKING, {
        onCompleted: () => {
            clearBookingData();
            displaySuccessNotification(
                "You've successfully booked the listing!",
                "Booking history can always be found in your User page."
            );
            refetchListing();
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to successfully book the listing. Please try again later!"
            );
        },
    });

    const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
    const listingPrice = price * daysBooked;

     const stripe = useStripe();
     const elements = useElements();

    const handleCreateBooking = async () => {
        if (!stripe || !elements) {
            return displayErrorMessage(
                "Sorry! We weren't able to connect with Stripe."
            );
        }

        const cardElement = elements.getElement(CardElement);

        if(!cardElement) {
            return displayErrorMessage(
                "Sorry! We weren't able to connect with Stripe."
            );
        }

        let { token: stripeToken, error } = await stripe.createToken(cardElement);
        if (stripeToken) {
            createBooking({
                variables: {
                    input: {
                        id: listingId,
                        source: stripeToken.id,
                        checkIn: moment(checkInDate).format("YYYY-MM-DD"),
                        checkOut: moment(checkOutDate).format("YYYY-MM-DD"),
                    },
                },
            });
        } else {
            displayErrorMessage(
                error && error.message
                    ? error.message
                    : "Sorry! We weren't able to book the listing. Please try again later."
            );
        }
    };


    return (
        <Modal
            open={modalVisible}
            centered
            footer={null}
            onCancel={() => setModalVisible(false)}
        >
            <div className="listing-booking-modal">
                <div className="listing-booking-modal__intro">
                    <Title className="listing-boooking-modal__intro-title">
                        <KeyOutlined />
                    </Title>
                    <Title
                        level={3}
                        className="listing-boooking-modal__intro-title"
                    >
                        Book your trip
                    </Title>
                    <Paragraph>
                        Enter your payment information to book the listing from
                        the dates between{" "}
                        <Text mark strong>
                            {moment(checkInDate).format("MMMM Do YYYY")}
                        </Text>{" "}
                        and{" "}
                        <Text mark strong>
                            {moment(checkOutDate).format("MMMM Do YYYY")}
                        </Text>
                        , inclusive.
                    </Paragraph>
                </div>

                <Divider />

                <div className="listing-booking-modal__charge-summary">
                    <Paragraph>
                        {formatListingPrice(price, false)} * {daysBooked} days ={" "}
                        <Text strong>
                            {formatListingPrice(listingPrice, false)}
                        </Text>
                    </Paragraph>
                    <Paragraph className="listing-booking-modal__charge-summary-total">
                        Total ={" "}
                        <Text mark>
                            {formatListingPrice(listingPrice, false)}
                        </Text>
                    </Paragraph>
                </div>

                <Divider />

                <div className="listing-booking-modal__stripe-card-section">
                    <CardElement className="listing-booking-modal__stripe-card" />
                    <Button
                        size="large"
                        type="primary"
                        className="listing-booking-modal__cta"
                        loading={loading}
                        onClick={handleCreateBooking}
                    >
                        Book
                    </Button>
                </div>
            </div>
        </Modal>
    );
};