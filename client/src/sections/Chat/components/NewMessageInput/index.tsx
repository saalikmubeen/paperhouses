import { useMutation } from '@apollo/client';
import React, { useState } from 'react'
import { CREATE_MESSAGE } from '../../../../lib/graphql/mutations';
import { CreateMessage as CreateMessageData, CreateMessageVariables } from '../../../../lib/graphql/mutations/CreateMessage/__generated__/CreateMessage';
import { displaySuccessNotification } from '../../../../lib/utils';

interface Props {
    recipientId: string
}

export const NewMessageInput = ({ recipientId }: Props) => {
    const [message, setMessage] = useState("");

    // MUTATION TO SEND MESSAGE
    const [createMessage] = useMutation<
        CreateMessageData,
        CreateMessageVariables
    >(CREATE_MESSAGE, {
        onCompleted: () => {
            // displaySuccessNotification("Message Sent");
        },
        onError: (err) => {
            console.log(err);
        },
    });

    const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setMessage("");

            createMessage({
                variables: {
                    input: {
                        content: message,
                        to: recipientId,
                    },
                },
            });
        }
    };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         setMessage(e.target.value);
     };

    return (
        <div className="new-message-input-wrapper">
            <input
                placeholder={"Message..."}
                value={message}
                onChange={handleChange}
                onKeyDown={handleSendMessage}
            />
        </div>
    );
}
