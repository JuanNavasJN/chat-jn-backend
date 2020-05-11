const ibm = require('ibm-cos-sdk');
const {
    user,
    login,
    userUpdate,
    getAllUsers,
    userCreate,
} = require('../controllers/user');

const { chatCreate, getChats } = require('../controllers/chat');

const {
    getAllMessages,
    messageUpdate,
    messageCreate,
    getMessagesByChatId,
} = require('../controllers/message');

const config = {
    endpoint: process.env.COS_ENDPOINT,
    apiKeyId: process.env.COS_API_KEY_ID,
    serviceInstanceId: process.env.COS_SERVICE_ID,
};

const cos = new ibm.S3(config);

const resolvers = {
    Query: {
        user,
        getAllUsers,
        getChats,
        getAllMessages,
        getMessagesByChatId,
    },
    Mutation: {
        userCreate,
        messageCreate,
        chatCreate,
        messageUpdate,
        userUpdate,
        login,
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
