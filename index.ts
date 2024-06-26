import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import { PORT, connectMongoDB } from "./config";
import http from "http";

import { Mutex } from "async-mutex";

import ListingRouter from "./routes/ListingRoute/create-listing.route";
import SaveListingRouter from "./routes/ListingRoute/save-listing.route";
import DeleteListingRouter from "./routes/ListingRoute/delete-listing.route";
import UpdateListingRouter from "./routes/ListingRoute/update-listing.route";

export const flagMutex = new Mutex();
export const iterator = new Mutex();

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "./public")));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const server = http.createServer(app);

// Define routes for different API endpoints
app.use("/api", ListingRouter);
app.use("/api", SaveListingRouter);
app.use("/api", DeleteListingRouter);
app.use("/api", UpdateListingRouter);

// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Backend Server is Running now!");
});

// Set Global Variable Iterator for unisat api distribution
app.locals.iterator = 0;

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
