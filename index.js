require('dotenv').config();

const mongoose = require('mongoose');
//------------------------- DB ----------------------------

mongoose.set('useFindAndModify', false);
mongoose.connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) throw err;

        console.log('Database ONLINE' + ' - ' + new Date().toLocaleString());
    }
);

//-------------------------------------------------------------------------------------------------------------------------

const { ApolloServer } = require('apollo-server');

const { typeDefs } = require('./schema/typeDefs');
const { resolvers } = require('./schema/resolvers');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
});

server.listen(process.env.PORT).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
