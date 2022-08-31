const users = []

// addUser removeUser getUser getUsersInRoom
const addUser = ( {id, username, room}) =>{
    //clean 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    // valid
    if(!username || !room){
        return {
            'error' : 'Username and Room are required!'
        }
    }
    // existAlready?
    const existUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existUser) return {'error' : 'Username already in user'}

    const user = {id, username, room}
    users.push(user);
    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id == id)

    if(index!=-1)
        return users.splice(index,1)[0]
}

const getUser = (id) => {
    const existUser = users.find((user)=> { return user.id == id})
    if(existUser)
        return existUser
    else
        return undefined    
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room == room)
}


module.exports = {
    addUser, removeUser, getUsersInRoom, getUser
}