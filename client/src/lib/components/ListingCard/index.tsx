import React from "react";
import { Link } from "react-router-dom";
import { Card, Typography } from "antd";
import Icon, {
    UserOutlined,
} from "@ant-design/icons";
import { iconColor, formatListingPrice } from "../../utils";

interface Props {
  listing: {
    id: string;
    title: string;
    image: string;
    address: string;
    price: number;
    numOfGuests: number;
  };
}

const { Text, Title } = Typography;

export const ListingCard = ({ listing }: Props) => {
  const { id, title, image, address, price, numOfGuests } = listing;

  return (
      <Link to={`/listing/${id}`}>
          <Card
              hoverable
              cover={
                  <div
                      style={{ backgroundImage: `url(${image})` }}
                      className="listing-card__cover-img"
                  />
              }
          >
              <div className="listing-card__details">
                  <div className="listing-card__description">
                      <Title level={4} className="listing-card__price">
                          {formatListingPrice(price)}
                          <span>/day</span>
                      </Title>
                      <Text strong ellipsis className="listing-card__title">
                          {title}
                      </Text>
                      <Text ellipsis className="listing-card__address">
                          {address}
                      </Text>
                  </div>
                  <div className="listing-card__dimensions listing-card__dimensions--guests">
                      <Icon
                          component={
                              UserOutlined as React.ForwardRefExoticComponent<any>
                          }
                          style={{ color: iconColor }}
                      />
                      <Text>{numOfGuests} guests</Text>
                  </div>
              </div>
          </Card>
      </Link>
  );
};
