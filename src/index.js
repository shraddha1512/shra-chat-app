const express = require('express')
const path = require('path')
const Filter = require('bad-words')
const port = process.env.PORT || 3000
const publicPathDirectory = path.join(__dirname,'../public')

const app = express()
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer);

const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { getUser, addUser, removeUser, getUsersInRoom } = require('./utils/users')

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')
    // socket.emit('sendMessage', generateMessage('Welcome!'))
    // socket.broadcast.emit('sendMessage', generateMessage('A new user has joined'))
    
    socket.on('join',(option, callback)=>{
        
        const {error, user} = addUser({ id: socket.id, ...option})

        if(error){
            return callback(error);
        }

        socket.join(user.room)
        socket.emit('sendMessage', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('sendMessage',generateMessage('Admin',`${user.username} has joined`))

        io.to(user.room).emit('roomData',{
            'room' : user.room, 
            'users' : getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            io.to(user.room).emit('sendMessage',generateMessage(user.username,filter.clean(message)))
            return callback('Profanity is not allowed.')
        }
        io.to(user.room).emit('sendMessage',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('sendLocation', generateLocationMessage(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{

        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('sendMessage', generateMessage('Admin', `${user.username} has left.`))
            io.to(user.room).emit('roomData',{
                'room' : user.room, 
                'users' : getUsersInRoom(user.room)
            })
        }
        
    })
})


app.use(express.static(publicPathDirectory))
app.get("/", (req,res)=>{
    res.render('index')
})



httpServer.listen(port,()=>{
    console.log("server is running on port "+port)
})