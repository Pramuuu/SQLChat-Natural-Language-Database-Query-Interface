// import express from 'express';
// import cors from 'cors';
// import generate from './api.js';

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "*" }));

// const PORT = process.env.PORT || 3007;

// app.get('/', (req, res) => {
//     res.send("Hello World");
// });

// app.post('/generate', async(req,res) => {
//     try{
//         const {queryDescription} = req.body;
//         console.log(queryDescription);
//         const sqlQuery=await generate(queryDescription);
//         res.json({answer: sqlQuery});
//     } catch(error){
//         console.log(error);
//         res.json(sqlQuery: 'Great Question. I seem to be having a problem. Please ask again')
//     }

// })

// app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });






// import express from 'express';
// import cors from 'cors';
// import generate from './api.js'; // Ensure './api.js' contains the `generate` function

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "*" }));

// const PORT = process.env.PORT || 3007;

// app.get('/', (req, res) => {
//     res.send("Hello World");
// });

// app.post('/generate', async (req, res) => {
//     try {
//         const { queryDescription } = req.body;
//         console.log(queryDescription);
//         const sqlQuery = await generate(queryDescription);
//         res.json({ answer: sqlQuery });
//     } catch (error) {
//         console.error(error); // Use console.error for error logging
//         res.json({ answer: 'Great Question. I seem to be having a problem. Please ask again.' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });





import express from 'express';
import cors from 'cors';
import generate from './api.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 3007;

app.get('/', (req, res) => {
    res.send("Hello World! The API is running.");
});

app.post('/generate', async (req, res) => {
    try {
        const { queryDescription } = req.body;

        if (!queryDescription) {
            return res.status(400).json({
                error: true,
                message: 'queryDescription is required.',
            });
        }

        console.log(`Received queryDescription: ${queryDescription}`);
        const sqlQuery = await generate(queryDescription);
        res.json({ answer: sqlQuery });
    } catch (error) {
        console.error('Error in /generate:', error);
        res.status(500).json({
            error: true,
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

