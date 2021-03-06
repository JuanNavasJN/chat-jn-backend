// const gql = require('graphql-tag');
const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        _id: ID!
        name: String!
        username: String!
        password: String!
        createdAt: String!
        updatedAt: String!
        avatar: String
    }

    input UserCreateInput {
        name: String!
        username: String!
        password: String!
    }

    input UserUpdateInput {
        _id: ID!
        name: String!
        username: String!
        password: String
        avatar: String!
    }

    type Message {
        _id: ID!
        text: String!
        userId: ID!
        chatId: ID!
        sent: Boolean!
        pending: Boolean!
        receive: Boolean!
        createdAt: String!
        updatedAt: String!
    }

    input MessageCreateInput {
        text: String!
        userId: ID!
        chatId: ID!
        sent: Boolean!
        pending: Boolean!
        receive: Boolean!
    }

    input MessageUpdateInput {
        _id: ID!
        text: String!
        userId: ID!
        chatId: ID!
        sent: Boolean!
        pending: Boolean!
        receive: Boolean!
    }

    type Chat {
        _id: ID!
        from: ID!
        to: ID!
        createdAt: String!
        updatedAt: String!
    }

    type ChatWithNames {
        _id: ID
        name: String!
        avatar: String
        messages: [Message]
        createdAt: String
        updatedAt: String
    }

    input ChatInput {
        from: ID!
        to: ID!
    }

    type UserList {
        data: [UserResponse]
    }

    type ChatsList {
        data: [ChatWithNames]
    }

    type MessagesList {
        data: [Message]
    }

    input LoginInput {
        username: String!
        password: String!
    }

    type UserResponse {
        _id: ID
        name: String
        username: String
        createdAt: String
        updatedAt: String
        avatar: String
        accessToken: String
        message: String
    }

    # type File {
    #     filename: String!
    #     mimetype: String!
    #     encoding: String!
    # }

    type File {
        uri: String!
    }

    type Query {
        user(accessToken: String!): UserResponse
        getAllUsers(accessToken: String!): UserList
        getChats(accessToken: String!): ChatsList
        getAllMessages(accessToken: String!): MessagesList
        getMessagesByChatId(accessToken: String!, chatId: ID!): MessagesList
    }

    type Mutation {
        userCreate(data: UserCreateInput!): UserResponse
        userUpdate(accessToken: String!, data: UserUpdateInput!): UserResponse
        messageCreate(accessToken: String!, data: MessageCreateInput!): Message
        messageUpdate(accessToken: String!, data: MessageUpdateInput!): Message
        chatCreate(data: ChatInput!): Chat
        login(data: LoginInput!): UserResponse
        uploadFile(file: Upload!): File!
    }
`;

module.exports = { typeDefs };
