const Chat = require('../models/chat');
const mongoose = require('mongoose');

const { verifyToken } = require('../auth/jwt');

async function getAllChats(_, { accessToken }) {
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
    getAllChats,
};
