const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
const mongoose = require('mongoose');

const resolvers = {
    Query: {
        async user() {},
        async getAllUsers() {
            const all = await User.find({}).exec();
            return { data: all };
        },
        async getAllChats() {
            let chats = await Chat.find({})
                .populate('from', 'name')
                .populate('to', 'name')
                .exec();

            chats = chats.map(e => ({
                _id: e._id,
                from: e.from.name,
                to: e.to.name,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
            }));
            return { data: chats };
        },
        async getAllMessages() {
            const messages = await Message.find({}).exec();

            return { data: messages };
        },
    },
    Mutation: {
        async userCreate(_, { data }) {
            const { name, username, password } = data;

            const user = new User({
                // _id: mongoose.Types.ObjectId(_id),
                name,
                password,
                username,
            });

            await user.save();
            return user;
        },
        async messageCreate(_, { data }) {
            const { text, userId, chatId, sent, pending, receive } = data;
            let message = new Message({
                text,
                userId,
                chatId,
                sent,
                pending,
                receive,
            });

            await message.save();
            return message;
        },
        async chatCreate(_, { data }) {
            const chat = new Chat({
                from: mongoose.Types.ObjectId(data.from),
                to: mongoose.Types.ObjectId(data.to),
            });

            await chat.save();

            return chat;
        },
    },
};

module.exports = { resolvers };
