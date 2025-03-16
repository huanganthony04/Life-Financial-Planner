import express from 'express'
import mongoose from 'mongoose'


const app = express()

// Move this into a .env maybe?
const MONGOURI = 'mongodb://localhost:27017/CSE361'
const PORT = 8080

await mongoose.connect(MONGOURI)
.then(() => {
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.log(`Error connecting to MongoDB: ${error}`)
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

