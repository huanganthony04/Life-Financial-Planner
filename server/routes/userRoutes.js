import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import UserModel from '../models/UserModel.js'
import getUserAuth from './middleware/auth.js'
import 'dotenv/config'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(CLIENT_ID)

const verifyGoogleToken = async function (idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID
        })
        const payload = ticket.getPayload()

        return payload
    }
    catch(error) {
        console.log(error)
    }
}

const router = express.Router()

// Do NOT use getUserAuth Middleware here because not being logged in is not an error
router.get('/api/getuser', async (req, res) => {

    if (!req.session.userId) {
        return res.status(200).json(null)
    }
    else {
        const user = await UserModel.findOne({_id: req.session.userId})
        if (!user) {
            return res.status(200).json(null)
        }
        return res.status(200).json({userId: user._id, email: user.email})
    }
})

router.post('/api/login', async (req, res) => {

    const token = req.body.credential

    await verifyGoogleToken(token)
        .then(async (data) => {
            const {sub, email} = data

            const user = await UserModel.findOne({ _id: sub, email: email })
            if (user) {
                req.session.userId = sub
                req.session.email = email
                res.status(200).send({status: 'Success', message: 'Logged in'})
            }
            else {
                let newUser = new UserModel({
                    _id: sub,
                    email: email
                })

                await newUser.save()
                .then(() => {
                    req.session.userId = sub
                    req.session.email = email
                    res.status(200).send({status: 'Success', message: 'Logged in'})
                }).catch((err) => {
                    console.log(`Error saving user: ${err}`)
                    return res.status(500).send({status: 'ERROR', message: err})
                })
            }
        })
        .catch((err) => {
            console.log(`Error verifying token: ${err}`)
            res.status(500).send({status: 'ERROR', message: err})
        })

})

router.post('/api/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).send({ message: 'Could not destroy session' });
        }
    
        // Only after the session is destroyed, clear the cookie
        res.clearCookie('connect.sid'); 
        return res.status(200).send({ message: 'Session destroyed' });
    });
})

export default router