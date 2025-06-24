// import dotenv from 'dotenv';
// import {DataSource} from "typeorm";
// import {SqlDatabase} from "langchain/sql_db";
// import {ChatOpenAI} from '@langchain/openai';
// import {
//     RunnablePassthrough,
//     RunnableSequence,
//    } from "@langchain/core/runnables";
//    import { PromptTemplate } from "@langchain/core/prompts";
//    import { StringOutputParser} from "@langchain/core/output_parsers";



//    dotenv.config();
//    const openaiApiKey= process.env.OPEN_API_KEY;
//    if (!openaiApiKey){
//     console.error('OPEN_API_KEY not found in environment');
//     process.exit(1);
//    }
//    const datasource = new DataSource({
//     type: "sqlite",
//     database: "Chinook.db",
//    });

//    const db = await SqlDatabase.fromDataSourceParams({
//     appDataSource: datasource,
//    });
//    const prompt =
//    PromptTemplate.fromTemplate(`Based on the table schema below, write a SQL query that would answer the user's question. Return just the SQL and nothing else:
//    {schema}

//    Question: {question}
//    SQL Query:`);

//    const model = new ChatOpenAI({

//     });


//     const sqlQueryGeneratorChain = RunnableSequence.from([
//      RunnablePassthrough.assign({
//         schema: async () => db.getTableInfo(),
//     }),
//     prompt,
//     model.bind({ stop: ["\nSQLResult:"] }),
//     new StringOutputParser(),
//     ]);
//     const generate = async (queryDescription) => {

//         const finalResponsePrompt =
//         PromptTemplate.fromTemplate(`Based on the table schema below, question, sql query, and sql response, write a natural language response:
//         {schema}

//         Question: {question}
//         SQL Query: {query}
//         SQL Response: {response}`);

//         const fullChain = RunnableSequence.from([
//         RunnablePassthrough.assign({
//             query: sqlQueryGeneratorChain,
//         }),
//         {
//             schema: async () => db.getTableInfo(),
//             question: (input) => input.question,
//             query: (input) => input.query,
//             response: (input) => db.run(input.query),
//         },
//         finalResponsePrompt,
//         model,
//         ]);

//         const finalResponse = await fullChain.invoke({
//         question: `${queryDescription}?`,
//         });

//         return finalResponse.content;
//     }

//     export default generate;






// import dotenv from 'dotenv';
// import { DataSource } from "typeorm";
// import { SqlDatabase } from "langchain/sql_db";
// import { ChatOpenAI } from "@langchain/openai";
// import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { StringOutputParser } from "@langchain/core/output_parsers";

// dotenv.config();

// // Check for OpenAI API key
// const openaiApiKey = process.env.OPEN_API_KEY;
// if (!openaiApiKey) {
//   console.error("OPEN_API_KEY not found in environment");
//   process.exit(1);
// }

// // Initialize the database
// const datasource = new DataSource({
//   type: "sqlite",
//   database: "Chinook.db",
// });

// // Ensure database is initialized before use
// const db = await SqlDatabase.fromDataSourceParams({
//   appDataSource: datasource,
// });

// // Define the prompt template for SQL query generation
// const prompt = PromptTemplate.fromTemplate(`Based on the table schema below, write a SQL query that would answer the user's question. Return just the SQL and nothing else:
// {schema}

// Question: {question}
// SQL Query:`);

// // Define the OpenAI model
// const model = new ChatOpenAI({
//   openAIApiKey: openaiApiKey,
//   modelName: "gpt-4-1106-preview", // Adjust the model name as per your usage
//   maxTokens: 128,
// });

// // Define the SQL query generator chain
// const sqlQueryGeneratorChain = RunnableSequence.from([
//   RunnablePassthrough.assign({
//     schema: async () => db.getTableInfo(),
//   }),
//   prompt,
//   model.bind({ stop: ["\nSQLResult:"] }),
//   new StringOutputParser(),
// ]);

// // Define the generate function
// const generate = async (queryDescription) => {
//   const finalResponsePrompt = PromptTemplate.fromTemplate(`Based on the table schema below, question, sql query, and sql response, write a natural language response:
// {schema}

// Question: {question}
// SQL Query: {query}
// SQL Response: {response}`);

//   const fullChain = RunnableSequence.from([
//     RunnablePassthrough.assign({
//       query: sqlQueryGeneratorChain,
//     }),
//     {
//       schema: async () => db.getTableInfo(),
//       question: (input) => input.question,
//       query: (input) => input.query,
//       response: (input) => db.run(input.query),
//     },
//     finalResponsePrompt,
//     model,
//   ]);

//   try {
//     const finalResponse = await fullChain.invoke({
//       question: `${queryDescription}?`,
//     });

//     return finalResponse.content;
//   } catch (error) {
//     console.error("Error during query generation:", error);
//     return "An error occurred while generating the query. Please try again.";
//   }
// };

// export default generate;



import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SqlDatabase } from 'langchain/sql_db';
import { ChatOpenAI } from '@langchain/openai';
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

dotenv.config();

const openaiApiKey = process.env.OPEN_API_KEY;
if (!openaiApiKey) {
    console.error('OPEN_API_KEY not found in environment');
    process.exit(1);
} else {
    console.log("OpenAI API key loaded successfully.");
}

const datasource = new DataSource({
    type: "sqlite",
    database: "Chinook.db",
});

async function initializeDatabase() {
    try {
        await datasource.initialize();
        return await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}

const db = await initializeDatabase();

const prompt = PromptTemplate.fromTemplate(`
Based on the table schema below, write a SQL query that would answer the user's question. Return just the SQL and nothing else:
{schema}

Question: {question}
SQL Query:
`);

const model = new ChatOpenAI({
    openaiApiKey,
    temperature: 0,
});

const sqlQueryGeneratorChain = RunnableSequence.from([
    async (input) => ({
        schema: await db.getTableInfo(),
        question: input.question,
    }),
    prompt,
    model.bind({ stop: ["\nSQLResult:"] }),
    new StringOutputParser(),
]);

export default async function generate(queryDescription) {
    if (!queryDescription) {
        throw new Error("queryDescription is required.");
    }

    const sqlQuery = await sqlQueryGeneratorChain.invoke({ question: queryDescription });
    return sqlQuery.content;
}







