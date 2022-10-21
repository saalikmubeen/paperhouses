import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Col, Layout, Row } from "antd";
import { USER } from "../../lib/graphql/queries";
import {
  User as UserData,
  UserVariables
} from "../../lib/graphql/queries/User/__generated__/User";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { Viewer } from "../../lib/types";
import { UserBookings, UserListings, UserProfile } from "./components";

interface Props {
    viewer: Viewer;
    setViewer: (viewer: Viewer) => void;
}

type Params = Record<"id", string>;

const { Content } = Layout;
const PAGE_LIMIT = 4;

export const User = ({
  viewer,
  setViewer
}: Props) => {
  const [listingsPage, setListingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);

  let params = useParams<Params>() as Params;

  const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: params.id,
      bookingsPage,
      listingsPage,
      limit: PAGE_LIMIT
    }
  });

  const handleUserRefetch = async () => {
      await refetch();
  };


  const stripeError = new URL(window.location.href).searchParams.get(
      "stripe_error"
  );
  const stripeErrorBanner = stripeError ? (
      <ErrorBanner description="We had an issue connecting with Stripe. Please try again soon." />
  ) : null;


  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const user = data ? data.user : null;
  const viewerIsUser = viewer.id === params.id;

  const userListings = user ? user.listings : null;
  const userBookings = user ? user.bookings : null;

  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser} viewer={viewer} setViewer={setViewer} handleUserRefetch={handleUserRefetch}/>
  ) : null;

  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      listingsPage={listingsPage}
      limit={PAGE_LIMIT}
      setListingsPage={setListingsPage}
    />
  ) : null;

  // userBookings will be null only when the currently logged in user is not same as the user profile being viewed 
  const userBookingsElement = UserBookings ? (
    <UserBookings
      userBookings={userBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  return (
      <Content className="user">
          {stripeErrorBanner}
          <Row gutter={12} justify="space-between">
              <Col xs={24}>{userProfileElement}</Col>
              <Col xs={24}>
                  {userListingsElement}
                  {userBookingsElement}
              </Col>
          </Row>
      </Content>
  );
};
