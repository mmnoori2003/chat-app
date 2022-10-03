const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: "Username and room must be provided!"
        }
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if (existingUser) {
        return {
            error: "Username is already in use!"
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {

    const foundUser = users.find((user) => {
        return user.id === id
    })

    return foundUser
}

const getRoomUsers = (room) => {

    const foundUsers = users.filter((user) => {
        return user.room === room
    })

    return foundUsers
}

module.exports = {
    addUser, removeUser, getRoomUsers, getUser
}