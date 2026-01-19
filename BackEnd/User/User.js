const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/GymApp')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
    taskId: String,
    date: Date,
    progress: Number,
    checked: [String],
    history: [{
        value: Number,
        description: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: function() { return !this.isApple && !this.isGoogle; }, // Email is required only for non-social logins
        unique: true,
        sparse: true // Allows multiple documents to have a null email field
    },
    password: String,
    googleId: String,
    isGoogle: {type: Boolean, default: false},
    appleId: String,
    isApple: {type: Boolean, default: false},
    verification: String,
    dateCreated: {
        type: Date,
        default: Date.now
    },
    unlockedAchievements: {
        type: [String],
        default: []
    },
    streaks: {
        type: Map,
        of: {
            currentStreak: { type: Number, default: 0 },
            lastUpdate: { type: Date },
            lastNotificationDate: { type: Date }
        },
        default: {}
    },
    tasks: [taskSchema],
});

module.exports = mongoose.model('User', userSchema);