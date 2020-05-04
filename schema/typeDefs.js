const gql = require('graphql-tag');

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

    type Chat {
        _id: ID!
        from: ID!
        to: ID!
        createdAt: String!
        updatedAt: String!
    }

    type ChatWithNames {
        _id: ID
        from: String
        to: String
        createdAt: String
        updatedAt: String
    }

    input ChatInput {
        from: ID!
        to: ID!
    }

    type UserList {
        data: [User]
    }

    type ChatsList {
        data: [ChatWithNames]
    }

    type MessagesList {
        data: [Message]
    }

    type Query {
        user(id: ID): User
        getAllUsers(id: ID): UserList
        getAllChats(userId: ID): ChatsList
        getAllMessages(userId: ID): MessagesList
    }

    type Mutation {
        userCreate(data: UserCreateInput): User
        messageCreate(data: MessageCreateInput): Message
        chatCreate(data: ChatInput): Chat
    }
`;

module.exports = { typeDefs };
