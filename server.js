const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Event = require("./models/Event");
const Registration = require("./models/Registration");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
    res.json({
        message: "Event Registration API is running!"
    });
});

app.post("/api/events", async (req, res) => {
    try {
        const { title, description, date, location, capacity } = req.body;

        if (!title || !description || !date || !location || !capacity) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            location,
            capacity
        });

        res.status(201).json({
            message: "Event created successfully",
            event
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

app.get("/api/events", async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });

        res.json({
            count: events.length,
            events
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

app.post("/api/events/:eventId/register", async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                message: "Name, email and phone are required"
            });
        }

        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const registration = await Registration.create({
            eventId: event._id,
            name,
            email,
            phone
        });

        res.status(201).json({
            message: "Registration successful",
            registration
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

app.get("/api/events/:eventId/registrations", async (req, res) => {
    try {
        const registrations = await Registration.find({
            eventId: req.params.eventId
        });

        res.json({
            count: registrations.length,
            registrations
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

app.delete("/api/registrations/:registrationId", async (req, res) => {
    try {
        const registration = await Registration.findByIdAndDelete(
            req.params.registrationId
        );

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        res.json({
            message: "Registration cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});