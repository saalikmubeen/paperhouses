import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import {
    Button,
    Form,
    Input,
    InputNumber,
    Layout,
    Radio,
    Typography,
    Upload,
} from "antd";
import Icon, {
   LoadingOutlined,
   CloudUploadOutlined
} from "@ant-design/icons";

import { UploadChangeParam } from "antd/lib/upload";
import { HOST_LISTING } from "../../lib/graphql/mutations";
import {
    HostListing as HostListingData,
    HostListingVariables,
} from "../../lib/graphql/mutations/HostListing/__generated__/HostListing";
import { ListingType } from "../../lib/graphql/globalTypes";
import {
    iconColor,
    displaySuccessNotification,
    displayErrorMessage,
} from "../../lib/utils";
import { Viewer } from "../../lib/types";
import { SelectLocation } from "../../lib/components/Map";
import { useScrollToTop } from "../../lib/hooks/useScrollToTop";

interface Props {
    viewer: Viewer;
}

const dummyRequest = async ({ file, onSuccess }: any) => {
    setTimeout(() => {
        onSuccess("ok");
    }, 0);
};

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

export const Host = ({ viewer }: Props) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [address, setAddress] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [postalCode, setPostalCode] = useState<string>("");
    const [imageLoading, setImageLoading] = useState(false);
    const [imageBase64Value, setImageBase64Value] = useState<string | null>(
        null
    );

    const setFullAddress = (fullAddress: {address: string, city: string, state: string, postalCode: string}) => {
        setAddress(fullAddress.address);
        setCity(fullAddress.city)
        setState(fullAddress.state)
        setPostalCode(fullAddress.postalCode)
    }

    const [hostListing, { loading, data }] = useMutation<
        HostListingData,
        HostListingVariables
    >(HOST_LISTING, {
        onCompleted: (data) => {
            displaySuccessNotification(
                "You've successfully created your listing!"
            );
            navigate(`/listing/${data.hostListing.id}`);
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to create your listing. Please try again later."
            );
        },
    });


    const handleImageUpload = (info: UploadChangeParam) => {
        const { file } = info;

        if (file.status === "uploading") {
            setImageLoading(true);
            // return;
        }

        if (file.status === "done" && file.originFileObj) {
            getBase64Value(file.originFileObj, (imageBase64Value) => {
                setImageBase64Value(imageBase64Value);
                setImageLoading(false);
            });
        }
    };

    const handleHostListing = (values: any) => {
        const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

        const input = {
            ...values,
            address: fullAddress,
            image: imageBase64Value,
            price: values.price * 100,

        };
        delete input.city;
        delete input.state;
        delete input.postalCode;

        hostListing({
            variables: {
                input,
            },
        });
    };

    useScrollToTop();

     React.useEffect(() => {
         form.setFieldsValue({
             address,
             city,
             state,
             postalCode
         });
     }, [form, address, city, state, postalCode]);

    if (!viewer.id || !viewer.hasWallet) {
        return (
            <Content className="host-content">
                <div className="host__form-header">
                    <Title level={4} className="host__form-title">
                        You'll have to be signed in and connected with Stripe to
                        host a listing!
                    </Title>
                    <Text type="secondary">
                        We only allow users who've signed in to our application
                        and have connected with Stripe to host new listings. You
                        can sign in at the <Link to="/login">/login</Link> page
                        and connect with Stripe shortly after.
                    </Text>
                </div>
            </Content>
        );
    }

    if (loading) {
        return (
            <Content className="host-content">
                <div className="host__form-header">
                    <Title level={3} className="host__form-title">
                        Please wait!
                    </Title>
                    <Text type="secondary">
                        We're creating your listing now.
                    </Text>
                </div>
            </Content>
        );
    };

    console.log(address)
    return (
        <Content className="host-content">
            <Form layout="vertical" onFinish={handleHostListing} form={form}>
                <div className="host__form-header">
                    <Title level={3} className="host__form-title">
                        Hi! Let's get started listing your place.
                    </Title>
                    <Text type="secondary">
                        In this form, we'll collect some basic and additional
                        information about your listing.
                    </Text>
                </div>

                <Form.Item
                    label="Home Type"
                    name="type"
                    rules={[
                        {
                            required: true,
                            message: "Please select a home type!",
                        },
                    ]}
                >
                    <Radio.Group>
                        <Radio.Button value={ListingType.APARTMENT}>
                            <Icon type="bank" style={{ color: iconColor }} />{" "}
                            <span>Apartment</span>
                        </Radio.Button>
                        <Radio.Button value={ListingType.HOUSE}>
                            <Icon type="home" style={{ color: iconColor }} />{" "}
                            <span>House</span>
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    label="Max # of Guests"
                    name="numOfGuests"
                    rules={[
                        {
                            required: true,
                            message: "Please enter a max number of guests!",
                        },
                    ]}
                >
                    <InputNumber min={1} placeholder="4" />
                </Form.Item>

                <Form.Item
                    label="Title"
                    name="title"
                    extra="Max character count of 45"
                    rules={[
                        {
                            required: true,
                            message: "Please enter a title for your listing!",
                        },
                    ]}
                >
                    <Input
                        maxLength={45}
                        placeholder="The iconic and luxurious Bel-Air mansion"
                    />
                </Form.Item>

                <Form.Item
                    label="Description of listing"
                    name="description"
                    extra="Max character count of 400"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter a description for your listing!",
                        },
                    ]}
                >
                    <Input.TextArea
                        rows={3}
                        maxLength={400}
                        placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
                    />
                </Form.Item>

                <Item
                    label="Address"
                    name="address"
                    rules={[
                        {
                            required: true,
                            message: "Please enter a address for your listing!",
                        },
                    ]}
                >
                    <Input placeholder="251 North Bristol Avenue" />
                </Item>

                <Form.Item
                    label="City/Town"
                    name="city"
                    initialValue={city}
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter a city (or region) for your listing!",
                        },
                    ]}
                >
                    <Input placeholder="Los Angeles" />
                </Form.Item>

                <Form.Item
                    label="State/Province"
                    name="state"
                    initialValue={state}
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter a state (or province) for your listing!",
                        },
                    ]}
                >
                    <Input placeholder="California" />
                </Form.Item>

                <Form.Item
                    label="Zip/Postal Code"
                    name="postalCode"
                    initialValue={postalCode}
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter a zip (or postal) code for your listing!",
                        },
                    ]}
                >
                    <Input placeholder="Please enter a zip code for your listing!" />
                </Form.Item>

                <Item label="Or use the marker on the map instead!">
                    <SelectLocation setFullAddress={setFullAddress} />
                </Item>

                <Form.Item
                    label="Image"
                    name="image"
                    extra="Images have to be under 1MB in size and of type JPG or PNG"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter provide an image for your listing!",
                        },
                    ]}
                >
                    <div className="host__form-image-upload">
                        <Upload
                            name="image"
                            listType="picture-card"
                            customRequest={dummyRequest}
                            showUploadList={false}
                            beforeUpload={beforeImageUpload}
                            onChange={handleImageUpload}
                        >
                            {imageBase64Value ? (
                                <img src={imageBase64Value} alt="Listing" />
                            ) : (
                                <div>
                                    {imageLoading ? (
                                        <LoadingOutlined color={iconColor} />
                                    ) : (
                                        <CloudUploadOutlined
                                            color={iconColor}
                                        />
                                    )}
                                    <div className="ant-upload-text">
                                        Upload
                                    </div>
                                </div>
                            )}
                        </Upload>
                    </div>
                </Form.Item>

                <Form.Item
                    label="Price"
                    name="price"
                    extra="All prices in $USD/day"
                    rules={[
                        {
                            required: true,
                            message: "Please enter a price for your listing!",
                        },
                    ]}
                >
                    <InputNumber min={0} placeholder="120" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Content>
    );
};

const beforeImageUpload = (file: File) => {
    const fileIsValidImage =
        file.type === "image/jpeg" || file.type === "image/png";
    const fileIsValidSize = file.size / 1024 / 1024 <= 1;  // less than 1 MB

    if (!fileIsValidImage) {
        displayErrorMessage(
            "You're only able to upload valid JPG or PNG files!"
        );
        return false;
    }

    if (!fileIsValidSize) {
        displayErrorMessage(
            "You're only able to upload valid image files of under 1MB in size!"
        );
        return false;
    }

    return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (
    img: File | Blob,
    callback: (imageBase64Value: string) => void
) => {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    reader.onload = () => {
      console.log(reader.result)
        callback(reader.result as string);
    };
};
