const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        // required: true,
        default: "General",
    },
    date: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model("notes", UserSchema);