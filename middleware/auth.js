const jwt = require('jsonwebtoken')

const JWT_SECRET = '12345'

module.exports = function authorization(req, res, next) {
    const token = req.header('x-auth-token')
    if (!token) return res.send('Access denied. No token provided').status(400)

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.send(error.message).send(400)
    }
}
