const Socket = io()
const messageForm = document.querySelector('#message-form')
const messageFormInput = document.getElementById('message-form-input')
const messageFormButton = messageForm.querySelector('button')
const shareLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

Socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

Socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    document.querySelector('#sidebar').insertAdjacentHTML('beforeend', html)
})

Socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const messageInput = messageFormInput.value

    messageFormInput.value = ""
    messageFormButton.setAttribute('disabled', 'disabled')

    Socket.emit('sendMessage', messageInput, (error) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

shareLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported on your browser!")
    }

    shareLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        Socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            messageFormButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})


Socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href('/')
    }
})