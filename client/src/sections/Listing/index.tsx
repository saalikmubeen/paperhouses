import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Col, Layout, Row } from "antd";
import { Moment } from "moment";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { LISTING } from "../../lib/graphql/queries";
import {
    Listing as ListingData,
    ListingVariables,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import { Viewer } from "../../lib/types";
import {
    ListingBookings,
    ListingDetails,
    UpdateListing,
    CreateBookingModal,
    ListingCreateBooking,
    CreateReview
} from "./components";

type Params = Record<"id", string>;

interface Props {
    viewer: Viewer;
}

const { Content } = Layout;
const PAGE_LIMIT = 3;

export const Listing = ({ viewer }: Props) => {
    const [bookingsPage, setBookingsPage] = useState(1);
    const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { id } = useParams<Params>() as Params;

    const { loading, data, error, refetch } = useQuery<
        ListingData,
        ListingVariables
    >(LISTING, {
        variables: {
            id,
            bookingsPage,
            limit: PAGE_LIMIT,
        },
    });

    const handleListingRefetch = async () => {
        await refetch();
    };

    const clearBookingData = () => {
        setModalVisible(false);
        setCheckInDate(null);
        setCheckOutDate(null);
    };

    if (loading) {
        return (
            <Content className="listings">
                <PageSkeleton />
            </Content>
        );
    }

    if (error) {
        return (
            <Content className="listings">
                <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!" />
                <PageSkeleton />
            </Content>
        );
    }

    const listing = data ? data.listing : null;
    const listingBookings = listing ? listing.bookings : null;

    const listingDetailsElement = listing ? (
        <ListingDetails listing={listing} />
    ) : null;

    const listingBookingsElement = listingBookings ? (
        <ListingBookings
            listingBookings={listingBookings}
            bookingsPage={bookingsPage}
            limit={PAGE_LIMIT}
            setBookingsPage={setBookingsPage}
        />
    ) : null;

    const listingCreateBookingElement = listing ? (
        <ListingCreateBooking
            viewer={viewer}
            host={listing.host}
            price={listing.price}
            bookingsIndex={listing.bookingsIndex}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            setCheckInDate={setCheckInDate}
            setCheckOutDate={setCheckOutDate}
            setModalVisible={setModalVisible}
        />
    ) : null;

    const createBookingModalElement =
        listing && checkInDate && checkOutDate ? (
            <CreateBookingModal
                listingId={listing.id}
                price={listing.price}
                modalVisible={modalVisible}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                setModalVisible={setModalVisible}
                clearBookingData={clearBookingData}
                refetchListing={handleListingRefetch}
            />
        ) : null;

    const listingReviewsElement = listing && (
        <CreateReview
            reviews={listing.reviews}
            viewer={viewer}
            listingId={listing.id}
            refetchListing={handleListingRefetch}
        />
    );

    return (
        <Content className="listings">
            <Row gutter={24} justify="space-between">
                <Col xs={24} lg={14}>
                    {listingDetailsElement}
                    {viewer.id === listing?.host.id && (
                        <UpdateListing
                            listing={listing}
                            refetchListing={handleListingRefetch}
                        />
                    )}
                    {listingBookingsElement}
                    {listingReviewsElement}
                </Col>
                <Col xs={24} lg={10}>
                    {listingCreateBookingElement}
                </Col>
            </Row>
            {createBookingModalElement}
        </Content>
    );
};
