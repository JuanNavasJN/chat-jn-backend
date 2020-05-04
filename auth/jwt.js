const jwt = require('jsonwebtoken');

const createToken = user => {
    return jwt.sign(
        {
            user: user,
        },
        process.env.SEED
    );
};

const verifyToken = token => {
    try {
        return jwt.verify(token, process.env.SEED);
    } catch (err) {
        return false;
    }
};

module.exports = { createToken, verifyToken };
