import mongoose from 'mongoose'
const { Schema } = mongoose;

const UserSchema = new Schema({

    _id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    ownedScenarios: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Scenario",
    }
})

const UserModel = mongoose.model('User', UserSchema)
export default UserModel
