const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const { createToken, verifyToken } = require('../auth/jwt');

const salt = bcrypt.genSaltSync(Number(process.env.BYCRYPT_SALT));

const resolvers = {
    Query: {
        async user(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('accessToken invalid');
            }

            return verification.user;
        },
        async getAllUsers() {
            const all = await User.find({}).exec();
            return { data: all };
        },
        async getAllChats(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('accessToken invalid');
            }
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
        async getAllMessages(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('accessToken invalid');
            }
            const messages = await Message.find({}).exec();

            // messages[1].text = cryptr.decrypt(messages[1].text);

            return { data: messages };
        },
    },
    Mutation: {
        async userCreate(_, { data }) {
            const { name, username, password } = data;

            const user = new User({
                // _id: mongoose.Types.ObjectId(_id),
                name,
                password: bcrypt.hashSync(password, salt),
                username,
            });

            await user.save();
            return user;
        },
        async messageCreate(_, { data, accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('accessToken invalid');
            }
            const { text, userId, chatId, sent, pending, receive } = data;
            let message = new Message({
                text: cryptr.encrypt(text),
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
        async messageUpdate(_, { data, accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('accessToken invalid');
            }
            const { _id, text, userId, chatId, sent, pending, receive } = data;

            const message = await Message.findByIdAndUpdate(
                _id,
                {
                    // text,
                    userId,
                    chatId,
                    sent,
                    pending,
                    receive,
                },
                { new: true }
            ).exec();

            return message;
        },
        async userUpdate(_, { data, accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('accessToken invalid');
            }
            const { _id, name, username, avatar, password } = data;

            let user;

            if (password !== undefined) {
                user = await User.findByIdAndUpdate(
                    _id,
                    {
                        name,
                        username,
                        avatar,
                        password: bcrypt.hashSync(password, salt),
                    },
                    { new: true }
                ).exec();
            } else {
                user = await User.findByIdAndUpdate(
                    _id,
                    {
                        name,
                        username,
                        avatar,
                    },
                    { new: true }
                ).exec();
            }

            return user;
        },

        async login(_, { data }) {
            const { username, password } = data;

            const user = await User.findOne({ username }).exec();

            const passwordValid = bcrypt.compareSync(password, user.password);

            if (passwordValid === true) {
                user.accessToken = createToken(user);
                return user;
            }

            return null;
        },
    },
};

module.exports = { resolvers };
