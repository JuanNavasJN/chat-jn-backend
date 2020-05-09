const User = require('../models/user');
const Chat = require('../models/chat');

const bcrypt = require('bcryptjs');

const { createToken, verifyToken } = require('../auth/jwt');

const salt = bcrypt.genSaltSync(Number(process.env.BYCRYPT_SALT));

async function user(_, { accessToken }) {
    const verification = verifyToken(accessToken);
    if (verification === false) {
        throw new Error('Invalid accessToken');
    }

    return verification.user;
}

async function getAllUsers(_, { accessToken }) {
    const verification = verifyToken(accessToken);
    if (verification === false) {
        throw new Error('Invalid accessToken');
    }

    const all = await User.find({}).exec();
    return { data: all };
}

async function userCreate(_, { data }) {
    const { name, username, password } = data;

    const user = new User({
        // _id: mongoose.Types.ObjectId(_id),
        name,
        password: bcrypt.hashSync(password, salt),
        username,
    });

    await user.save();

    const users = await User.find(
        { _id: { $ne: user._id } },
        { _id: true }
    ).exec();

    if (users.length > 0) {
        users.forEach(u => {
            Chat.create({
                private: true,
                people: [u._id, user._id],
            });
        });
    }

    return user;
}

async function userUpdate(_, { data, accessToken }) {
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
}

async function login(_, { data }) {
    const { username, password } = data;

    const user = await User.findOne({ username }).exec();

    if (user === null) throw new Error('Incorrect username or password');

    const passwordValid = bcrypt.compareSync(password, user.password);

    if (passwordValid === true) {
        user.accessToken = createToken(user);
        return user;
    }

    throw new Error('Incorrect username or password');
}

module.exports = {
    user,
    login,
    userUpdate,
    getAllUsers,
    userCreate,
};
