const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const { createToken, verifyToken } = require('../auth/jwt');
const ibm = require('ibm-cos-sdk');

const salt = bcrypt.genSaltSync(Number(process.env.BYCRYPT_SALT));

const config = {
    endpoint: process.env.COS_ENDPOINT,
    apiKeyId: process.env.COS_API_KEY_ID,
    serviceInstanceId: process.env.COS_SERVICE_ID,
};

const cos = new ibm.S3(config);

const resolvers = {
    Query: {
        async user(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('Invalid accessToken');
            }

            return verification.user;
        },
        async getAllUsers(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('Invalid accessToken');
            }

            const all = await User.find({}).exec();
            return { data: all };
        },
        async getAllChats(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('Invalid accessToken');
            }
            let chats = await Chat.find({ from: verification.user._id })
                .populate('from', 'name username')
                .populate('to', 'name username')
                .exec();

            // ------------------------- Validation for Admin ------------------------------
            //---- If username is not equal to 'juannavas' return only
            //    chat with e.to.username is equal to 'juannavas'
            if (verification.user.username !== 'juannavas') {
                let allChats = [];
                for await (let e of chats) {
                    if (e.to.username === 'juannavas') {
                        let messages = await Message.find({
                            chatId: e._id,
                        }).exec();
                        allChats.push({
                            _id: e._id,
                            from: e.from.name,
                            to: e.to.name,
                            createdAt: e.createdAt,
                            updatedAt: e.updatedAt,
                            messages,
                        });
                    }
                }
                chats = allChats;
            } else {
                let allChats = [];
                for await (let e of chats) {
                    let messages = await Message.find({ chatId: e._id }).exec();
                    allChats.push({
                        _id: e._id,
                        from: e.from.name,
                        to: e.to.name,
                        createdAt: e.createdAt,
                        updatedAt: e.updatedAt,
                        messages,
                    });
                }
                chats = allChats;
            }

            return { data: chats };
        },
        async getAllMessages(_, { accessToken }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('Invalid accessToken');
            }
            const messages = await Message.find({}).exec();

            // messages[1].text = cryptr.decrypt(messages[1].text);

            return { data: messages };
        },
        async getMessagesByChatId(_, { accessToken, chatId }) {
            const verification = verifyToken(accessToken);
            if (verification === false) {
                throw new Error('Invalid accessToken');
            }

            let messages = await Message.find({
                chatId,
                userId: verification.user._id,
            }).exec();

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
                throw new Error('Invalid accessToken');
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
                throw new Error('Invalid accessToken');
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
                throw new Error('Invalid accessToken');
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

            if (user === null)
                throw new Error('Incorrect username or password');

            const passwordValid = bcrypt.compareSync(password, user.password);

            if (passwordValid === true) {
                user.accessToken = createToken(user);
                return user;
            }

            throw new Error('Incorrect username or password');
        },
        async uploadFile(_, { file }) {
            const { filename, encoding } = await file;
            // console.log('uploading... ' + new Date().getTime());

            const buffer = Buffer.from(encoding, 'base64');
            const key = 'chatjn/avatars/' + filename;
            const uri = process.env.IBM_BUCKET_URI + key;

            //-----------------------------------------------------------

            try {
                await cos
                    .putObject({
                        Bucket: 'cloud-object-storage-vx-cos-standard-2kv',
                        Key: key,
                        Body: buffer,
                    })
                    .promise();
            } catch (e) {
                console.log('error to upload to ibm s3');
                console.log(e);
                throw new Error('error to upload to IBM s3');
            }

            //-----------------------------------------------------------

            return { uri };
        },
    },
};

module.exports = { resolvers };
