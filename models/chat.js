const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let chatSchema = new Schema(
    {
        name: {
            type: String,
        },
        people: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        private: {
            type: Boolean,
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Chat', chatSchema);
