import UserModel from '../../models/UserModel.js'


/**
 * Middleware to check if the user is authenticated.
 * Returns the user object if found, stored in req.user.
 * Returns a 401 error if the user is not logged in or not found.
 */
const getUserAuth = async (req, res, next) => {

    const userId = req.session.userId
    if (!userId) {
        return res.status(401).json({error: 'You are not logged in!'})
    }

    const user = await UserModel.findOne({_id: userId})
    if (!user) {
        return res.status(401).json({error: 'User not found!'})
    }

    req.user = user
    req.email = user.email
    next()

}

export default getUserAuth