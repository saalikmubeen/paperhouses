export interface CreateMessageInput {
    content: string;
    to: string;
}

export interface CreateMessageArgs {
    input: CreateMessageInput;
}


export interface SendMessageArgs {
    to: string;
}
