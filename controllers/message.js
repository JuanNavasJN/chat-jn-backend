const Message = require('../models/message');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const { verifyToken } = require('../auth/jwt');

async function getAllMessages(_, { accessToken }) {
    const verification = verifyToken(accessToken);
    if (verification === false) {
        throw new Error('Invalid accessToken');
    }
    const messages = await Message.find({}).exec();

    // messages[1].text = cryptr.decrypt(messages[1].text);

    return { data: messages };
}

async function getMessagesByChatId(_, { accessToken, chatId }) {
    const verification = verifyToken(accessToken);
    if (verification === false) {
        throw new Error('Invalid accessToken');
    }

    let messages = await Message.find({
        chatId,
        userId: verification.user._id,
    }).exec();

    return { data: messages };
}

async function messageCreate(_, { data, accessToken }) {
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
}

async function messageUpdate(_, { data, accessToken }) {
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
}

module.exports = {
    getAllMessages,
    messageUpdate,
    messageCreate,
    getMessagesByChatId,
};
