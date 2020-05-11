const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let messageSchema = new Schema(
    {
        text: {
            type: String,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        receive: {
            type: Boolean,
        },
        sent: {
            type: Boolean,
        },
        pending: {
            type: Boolean,
        },
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Message', messageSchema);
