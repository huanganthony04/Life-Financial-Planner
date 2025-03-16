import mongoose from 'mongoose'
const { Schema } = mongoose;

const UserSchema = new Schema({

    email: {type: string},
    username: {type: string},

})

const UserModel = mongoose.model('User', UserSchema)
export default UserModel
