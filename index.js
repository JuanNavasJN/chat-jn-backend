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
// const express = require('express');
// const graphqlHTTP = require('express-graphql');
// const expressPlayground = require('graphql-playground-middleware-express')
//     .default;

// const cors = require('cors');
// const port = 8080;
// const app = express();

// =---------------------------------------------------------
// const { makeExecutableSchema } = require('graphql-tools');
// const { typeDefs } = require('./schema/typeDefs');
// const { resolvers } = require('./schema/resolvers');
// const schema = makeExecutableSchema({
//     typeDefs,
//     resolvers,
// });
// // =---------------------------------------------------------

// app.use(cors());

// app.use(
//     '/graphql',
//     graphqlHTTP({
//         schema,
//         graphiql: true,
//     })
// );

// app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

//------------------------------------------------------

// app.listen(port, () => console.log(`listening to localhost:${port}`));

//-------------------------------------------------------------------------------------------------------------------------

const { ApolloServer } = require('apollo-server');

const { typeDefs } = require('./schema/typeDefs');
const { resolvers } = require('./schema/resolvers');

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(process.env.PORT).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
