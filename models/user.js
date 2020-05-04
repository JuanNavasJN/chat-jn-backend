const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let userSchema = new Schema(
    {
        name: {
            type: String,
        },
        username: {
            type: String,
            unique: true,
        },
        avatar: {
            type: String,
        },
        password: {
            type: String,
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

userSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};

module.exports = mongoose.model('User', userSchema);
