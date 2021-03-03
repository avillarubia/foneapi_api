const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const http = require('http').createServer(app)
const { Account, validateLogin } = require('./models/account')
const { Message } = require('./models/message')
const authorize = require('./middleware/auth')

const JWT_SECRET = '12345'

app.use(express.json())
app.use(cors())

const corsOptions = {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
}
const io = require('socket.io')(http, corsOptions);

app.get('/', (req, res) => {
    res.send('<h1>Hello from FONEAPI</h1>')
})

app.get('/messages', authorize, async (req, res) => {
    const messages = await Message.find({})
    res.send(messages)
})

app.get('/accounts', authorize, async (req, res) => {
    const accounts = await Account.find({})
    res.send(accounts)
})

app.patch('/accounts', authorize, async (req, res) => {
    let token = req.header('x-auth-token')
    const decoded = jwt.decode(token)

    let account = await Account.findOne({ account: decoded.account })

    if (!account) {
        res.status(401).send('Account not exists.')
    }

    const query = { account: decoded.account }
    const option = { new: true }

    account = new Account(req.body)
    await account.encryptPassword()

    req.body.password = account.password

    account = await Account.findOneAndUpdate(query, req.body, option)
    token = account.generateToken(req.body)

    res.send(token)
})

app.post('/registrations', async (req, res) => {
    const payload = req.body

    let account = await Account.findOne({ account: payload.account })

    if (account) {
        return res.status(409).send('Account already exists.')
    }

    account = new Account(payload)

    await account.encryptPassword()
    await account.save()

    const token = account.generateToken(payload)

    res.send(token)
})

app.post('/logins', async (req, res) => {
    const { account, password } = req.body
    const _account = await Account.findOne({ account })

    if (!_account) {
        return res.status(404).send('Account or password is invalid.')
    }

    const { password: encryptedPassword } = _account

    const isValid = await validateLogin(password, encryptedPassword)

    if (!isValid) {
        return res.status(401).send('Account or password is invalid.')
    }

    res.send(_account.generateToken(req.body))
})

io.use((socket, next) => {
    const { token } = socket.handshake.query

    if (!token) return
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        socket.decoded = decoded;
        next();
    } catch (error) {
        next(new Error(error));
    }
}).on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
        io.emit('chat message', msg);

        try {
            const message = new Message(msg)
            await message.save()
        } catch (error) {
            console.log(error)
        }

        socket.broadcast.emit('has message');
    });
    console.log('a user connected');
});

require('./starters/db')()

http.listen(3001, () => {
    console.log('listening on *:3001')
})