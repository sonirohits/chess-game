const express =require('express');
const socket =require('socket.io');
const http =require('http');
const { Chess} =require('chess.js');
const path =require('path');
const app =express();

const server =http.createServer(app);
const io=socket(server);

//socket hi jo banda he  jiski helpse ape aure me realtime me connect honge
//socket jo jo kar sakta he vo abe io kar sakta he

const chess=new Chess();

let players ={};
let currentPlayer= 'W';

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get('/',function(req,res){
res.render("index",{title:"Chess Game"});
});

                           //unique info about that banda
io.on("connection",function(socket){
console.log("connected");
if(!players.white){
    players.white =socket.id;
   socket.emit("playerRole","w");
}
else if(!players.black){
    players.black =socket.id;
    socket.emit("playerRole","b");
}
else{
    socket.emit("spectatorRole");
}

socket.on("disconnect",function(){
    if(socket.id === players.white){
        delete players.white;
    }
    else if(socket.id === players.black){
        delete players.black;
    }
});

socket.on("move",function(move){
    try{
       if(chess.turn() === 'w' && socket.id !== players.white) {
        return;
       }
       if(chess.turn() === 'b' && socket.id !== players.black) {
        return;
       }

     const result =  chess.move(move); //element move kar diya actual chess ke game me
     // backend pe move chal raha he
     if(result){
        currentPlayer =chess.turn();
        io.emit("move",move); //fronted ke liye  backend se fronted pe
        io.emit("boardState",chess.fen());
        //chess.fen() current state ki equation nikal dega vo abhi sabko bhej di he hamne
        //sabko bhej rahe he he ki ye move ho gaya he
     }
     else{
        console.log("Invalid move ",move);
        socket.emit("invalid move",move);//jisne wrong mve chala he usko batao ki ye move galat  he
     }
    }
    catch(err){
     console.log(err);
      socket.emit("Invalid move: ",move);
    }
})
});



server.listen(3000,function(){
    console.log('listning on http 3000');
})