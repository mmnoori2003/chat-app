const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const Filter = require('bad-words')
const { generateLocationMessage, generateMessage } = require('../utils/messages')
const { addUser, removeUser, getUser, getRoomUsers } = require('../utils/users')

const port = process.env.PORT || 3000
const app = express()
app.use(express.static(path.join(__dirname, '../statics')))

const server = http.createServer(app)
const io = new socketio.Server(server)

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, cb) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return cb(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome !'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('sendMessage', (inputMessage, cb) => {
        const user = getUser(socket.id)
        if (user) {
            const filter = new Filter()
            if (filter.isProfane(inputMessage)) {
                return cb('Profanity is not allowed!')
            }

            io.to(user.room).emit('message', generateMessage(user.username, inputMessage))
            cb()
        }

    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
        }
    })

    socket.on('sendLocation', (coords, cb) => {
        const user = getUser(socket.id)

        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords))
            cb()
        }
    })
})

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})