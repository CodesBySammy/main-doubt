// Import necessary modules
require("dotenv").config();
const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// MongoDB connection URLs for "questions", "emails", "answers", and "queries" databases
const questionsUrl = process.env.MONGO_questions_URL; // 'mongodb://localhost:27017'
const emailsUrl = process.env.MONGO_email_URL; // 'mongodb://localhost:27017'
const answersUrl = process.env.MONGO_answers_URL; // 'mongodb://localhost:27017'
const queriesUrl = process.env.MONGO_queries_URL; // 'mongodb://localhost:27017'



console.log('MongoDB Questions URL:', process.env.MONGO_questions_URL);
console.log('MongoDB Answers URL:', process.env.MONGO_answers_URL);
console.log('MongoDB Emails URL:', process.env.MONGO_email_URL);
console.log('MongoDB Queries URL:', process.env.MONGO_queries_URL);


// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies

// Session and cookie middleware with expiration time
app.use(cookieParser());
app.use(session({
    secret: "your_secret_key", // Change this to a secret key for session encryption
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set secure to true if using HTTPS
        maxAge: 10 * 60 * 1000 // 10 minutes in milliseconds
    }
}));

const PORT=process.env.PORT || 8080;
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to connect to MongoDB and fetch questions from the "questions" collection
async function fetchQuestions() {
    let client;
    try {
        client = await MongoClient.connect(questionsUrl);
        const db = client.db("questions");
        const questions = await db.collection("questions").find().toArray();
        return questions;
    } catch (err) {
        console.error("Error fetching questions from MongoDB:", err);
        return [];
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Function to connect to MongoDB and fetch answers from the "answers" collection
async function fetchAnswers() {
    let client;
    try {
        client = await MongoClient.connect(answersUrl);
        const db = client.db("answers");
        const answers = await db.collection("answers").find().toArray();
        return answers;
    } catch (err) {
        console.error("Error fetching answers from MongoDB:", err);
        return [];
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Function to connect to MongoDB and insert data into a specified collection
async function connectToMongo(url, dbName, data) {
    let client;
    try {
        client = await MongoClient.connect(url);
        const db = client.db(dbName);
        await db.collection(dbName).insertOne(data);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Route to handle GET requests for fetching questions
app.get("/questions", async function(req, res) {
    try {
        const questions = await fetchQuestions();
        res.json(questions);
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).send("Error fetching questions.");
    }
});

// Route to handle GET requests for fetching answers
app.get("/answers", async function(req, res) {
    try {
        const answers = await fetchAnswers();
        res.json(answers);
    } catch (err) {
        console.error("Error fetching answers:", err);
        res.status(500).send("Error fetching answers.");
    }
});

// Route to handle POST requests from the form in "contact.html" for submitting queries
app.post("/submitQuery", async function(req, res) {
    const { name, email, query } = req.body; // Extract data from the POST request

    try {
        // Connect to "questions" MongoDB and insert the query into the collection
        await connectToMongo(queriesUrl, "queries", { name, email, query });
        console.log("Query inserted into 'queries' collection successfully:", query);
        res.redirect("/"); // Redirect after successful submission
    } catch (err) {
        console.error("Error inserting query into 'queries' collection:", err);
        res.status(500).send("Error submitting query.");
    }
});

// Route to handle POST requests from the form in "another_page.html" for submitting questions with image URLs
app.post("/submitQuestion", async function(req, res) {
    const question = req.body.question; // Extract question from the POST request

    try {
        // Connect to "questions" MongoDB and insert the question into the collection
        await connectToMongo(questionsUrl, "questions", { question: question });
        console.log("Question inserted into 'questions' collection successfully:", question);
        res.redirect("/nn.html"); // Redirect after successful submission
    } catch (err) {
        console.error("Error inserting question into 'questions' collection:", err);
        res.status(500).send("Error submitting question.");
    }
});

// Route to handle POST requests from the form in "index.html" for submitting emails
app.post("/submitEmail", async function(req, res) {
    const email = req.body.email; // Extract email from the POST request
    console.log("Email:", email); // Print the email to the console

    try {
        // Connect to "emails" MongoDB and insert the email into a collection
        await connectToMongo(emailsUrl, "emails", { email: email });
        console.log("Email inserted into 'emails' collection successfully:", email);
        res.redirect("/about"); // Redirect to hom.html after email submission
    } catch (err) {
        console.error("Error inserting email into 'emails' collection:", err);
        res.status(500).send("Error submitting email.");
    }
});

// Route to handle POST requests from nn.html for submitting answers
app.post("/submitAnswer", async function(req, res) {
    const answer = req.body.answer; // Extract answer from the POST request

    try {
        // Connect to "answers" MongoDB and insert the answer into the collection
        await connectToMongo(answersUrl, "answers", { answer: answer });
        console.log("Answer inserted into 'answers' collection successfully:", answer);
        res.redirect("/"); // Redirect after successful submission
    } catch (err) {
        console.error("Error inserting answer into 'answers' collection:", err);
        res.status(500).send("Error submitting answer.");
    }
});

// Route to handle requests for "/another_page.html"
app.get("/another_page.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'another_page.html'));
});

// Route to handle requests for "/"
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle requests for "/nn.html"
app.get("/nn.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'nn.html'));
});

// Route to handle requests for "/about"
app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname, "hom.html"));
});

// Route to handle requests for "/answers.html"
app.get("/answers.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'answers.html'));
});

// Route to handle requests for "/contact.html"
app.get("/contact.html", function(req, res) {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Start the server
app.listen(PORT, function() {
    console.log("Server listening on port 8080");
});
