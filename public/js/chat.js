const shareLocation = document.querySelector('#share-location')
const socket = io()
//Elements
const $formMessage = document.querySelector('#form-message')
const $formInput = document.querySelector('#text-message')
const $formButton = document.querySelector('#btn-submit')
const $messages = document.querySelector('#messages')
//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageStyleMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageStyleMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('roomData', ({room, users}) =>{
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html   
})

socket.on('sendMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('sendLocation', (location)=>{
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$formMessage.addEventListener('submit',(e)=>{
    e.preventDefault();
    //disable
    $formButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage', $formInput.value, (error)=>{
        //enable
        $formButton.removeAttribute('disabled')
        $formInput.value =''
        $formInput.focus()
        if(error){
            alert(error)
        }
        console.log('Message delivered successfully!')
    })
})



shareLocation.addEventListener('click',()=>{
    //disable
    shareLocation.setAttribute('disabled','disabled')
    if (!navigator.geolocation) {
        return socket.emit('sendMessage', 'Geolocation is not supported by your browser')
      } 
    else {
        navigator.geolocation.getCurrentPosition((position)=>{
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                socket.emit('sendLocation',{latitude,longitude},()=>{
                    //enable
                    shareLocation.removeAttribute('disabled')
                    console.log('Location shared!')
                })
        });
      }
})