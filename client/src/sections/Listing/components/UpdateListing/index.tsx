import {
    Button,
    Form,
    Input,
    InputNumber,
    Layout,
    Radio,
    Typography,
    Upload,
    Modal
} from "antd";
import Icon, { LoadingOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { UploadChangeParam } from "antd/lib/upload";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_LISTING } from "../../../../lib/graphql/mutations/UpdateListing";
import {UpdateListing as UpdateListingData, UpdateListingVariables} from "../../../../lib/graphql/mutations/UpdateListing/__generated__/UpdateListing";
import { displayErrorMessage, displaySuccessNotification, formatListingPrice, iconColor } from "../../../../lib/utils";
import { ListingType } from "../../../../lib/graphql/globalTypes";
import { Viewer } from "../../../../lib/types";
import { Listing } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";


const dummyRequest = async ({ file, onSuccess }: any) => {
    setTimeout(() => {
        onSuccess("ok");
    }, 0);
};

const { Content } = Layout;
const { Text, Title } = Typography;

interface Props {
    listing: Listing["listing"];
    refetchListing: () => void
}

export const UpdateListing: React.FC<Props> = ({listing, refetchListing}) => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [imageLoading, setImageLoading] = useState(false);
    const [imageBase64Value, setImageBase64Value] = useState<string | null>(
        null
    );

    const [updateListing, { loading, data }] = useMutation<
        UpdateListingData,
        UpdateListingVariables
    >(UPDATE_LISTING, {
        onCompleted: (data) => {
            displaySuccessNotification(
                "You've successfully updated your listing!"
            );

            refetchListing();
            setOpen(false);
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to update your listing. Please try again later."
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

     const handleUpdateListing = (values: any) => {

         const input = {
             ...values,
             price: values.price * 100,
         };

         if(imageBase64Value) {
            input.image = imageBase64Value;
         }

         updateListing({
             variables: {
                id: listing.id,
                 input,
             },
         });
     };

    const showModal = () => {
        setOpen(true);
    };


    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={showModal}
                style={{ margin: "30px 0 16px 0" }}
            >
                Update the details of this listing!
            </Button>
            <Modal
                open={open}
                title={listing.title}
                onCancel={handleCancel}
                okButtonProps={{ style: { display: "none" } }}
            >
                {loading ? (
                    <Content>
                        <div className="host__form-header">
                            <Title level={3} className="host__form-title">
                                Please wait!
                            </Title>
                            <Text type="secondary">
                                We're updating your listing details.
                            </Text>
                        </div>
                    </Content>
                ) : (
                    <Content>
                        <Form
                            layout="vertical"
                            onFinish={handleUpdateListing}
                            form={form}
                        >
                            <div className="host__form-header">
                                <Title level={3} className="host__form-title">
                                    Hi! Update any details of your listing
                                </Title>
                                <Text type="secondary">
                                    In this form, we'll collect some basic
                                    information to update your listing.
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
                                initialValue={listing.type}
                            >
                                <Radio.Group>
                                    <Radio.Button value={ListingType.APARTMENT}>
                                        <Icon
                                            type="bank"
                                            style={{ color: iconColor }}
                                        />{" "}
                                        <span>Apartment</span>
                                    </Radio.Button>
                                    <Radio.Button value={ListingType.HOUSE}>
                                        <Icon
                                            type="home"
                                            style={{ color: iconColor }}
                                        />{" "}
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
                                        message:
                                            "Please enter a max number of guests!",
                                    },
                                ]}
                                initialValue={listing.numOfGuests}
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
                                        message:
                                            "Please enter a title for your listing!",
                                    },
                                ]}
                                initialValue={listing.title}
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
                                initialValue={listing.description}
                            >
                                <Input.TextArea
                                    rows={3}
                                    maxLength={400}
                                    placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
                                />
                            </Form.Item>

                            <Form.Item
                                label="Image"
                                name="image"
                                extra="Images have to be under 1MB in size and of type JPG or PNG. This field is optional"
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
                                            <img
                                                src={imageBase64Value}
                                                alt="Listing"
                                            />
                                        ) : (
                                            <div>
                                                {imageLoading ? (
                                                    <LoadingOutlined
                                                        color={iconColor}
                                                    />
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
                                        message:
                                            "Please enter a price for your listing!",
                                    },
                                ]}
                                initialValue={Math.round(listing.price / 100)}
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
                )}
            </Modal>
        </>
    );
};

const beforeImageUpload = (file: File) => {
    const fileIsValidImage =
        file.type === "image/jpeg" || file.type === "image/png";
    const fileIsValidSize = file.size / 1024 / 1024 <= 1; // less than 1 MB

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
        console.log(reader.result);
        callback(reader.result as string);
    };
};