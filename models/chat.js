const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let chatSchema = new Schema(
    {
        from: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Chat', chatSchema);
