const Chat = require('../models/chat');
const Message = require('../models/message');

const mongoose = require('mongoose');

const { verifyToken } = require('../auth/jwt');

async function getChats(_, { accessToken }) {
    const verification = verifyToken(accessToken);
    if (verification === false) {
        throw new Error('Invalid accessToken');
    }

    const currentId = verification.user._id;

    let chats = await Chat.find(
        {
            people: currentId,
        },
        'people private'
    )
        .populate('people', 'name username avatar')
        .exec();

    // ------------------------- Validation for Admin ------------------------------
    //---- If username is not equal to 'juannavas' return only
    //    chat with e.to.username is equal to 'juannavas'
    if (verification.user.username !== 'juannavas') {
        let allChats = [];
        for await (let e of chats) {
            let chat = e.people.find(user => user._id != currentId);
            if (chat.username === 'juannavas') {
                let messages = await Message.find({
                    chatId: e._id,
                })
                    .populate('user')
                    .exec();
                allChats.push({
                    _id: e._id,
                    name: chat.name,
                    avatar: chat.avatar,
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
            if (e.private === true) {
                let messages = await Message.find({ chatId: e._id })
                    .populate('user')
                    .exec();
                let chat = e.people.find(user => user._id != currentId);
                allChats.push({
                    _id: e._id,
                    avatar: chat.avatar,
                    name: chat.name,
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt,
                    messages,
                });
            }
        }
        chats = allChats;
    }

    return { data: chats };
}

async function chatCreate(_, { data }) {
    const chat = new Chat({
        from: mongoose.Types.ObjectId(data.from),
        to: mongoose.Types.ObjectId(data.to),
    });

    await chat.save();

    return chat;
}

module.exports = {
    chatCreate,
    getChats,
};
