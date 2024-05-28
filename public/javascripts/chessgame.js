const socket =io();

//sif itna likhne se ye line fronted pe chalegi
//automaticall ise line se backend par request chali jayegi
//io.on()jo likha he app.js pe vaha pe jayegi ye request

// socket.emit("churan"); //browser se kuch bhej rahe he backend par//fronted to backend kuch bheka

// socket.on("churan papdi",function(){
// console.log("churan papdi recived"); //browser ke console log pe dikhega
// });
const chess =new Chess();
const boardElement =document.querySelector(".chessboard");

let draggedPiece =null;
let sourceSquare =null;
let playerRole =null;

const renderBoard =function(){

const board =chess.board(); //chess ka imaginary board
boardElement.innerHTML=""; 

// console.log(board); //board will be print

board.forEach(function(row,rowindex){
row.forEach(function(square,squareindex){

    const squareElement =document.createElement("div");

    squareElement.classList.add("square",
        (rowindex + squareindex)%2 === 0 ? "light":"dark"
    );

    squareElement.dataset.row =rowindex;
    squareElement.dataset.col =squareindex;

    if(square){
        const pieceElement =document.createElement("div");
        pieceElement.classList.add("piece",
        square.color === "w" ? "white" : "black"
        );

        pieceElement.innerText =getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;
        pieceElement.addEventListener("dragstart",function(e){
         if(pieceElement.draggable){
            draggedPiece =pieceElement;
            sourceSquare ={row:rowindex,col:squareindex};
            e.dataTransfer.setData("text/plain","");
         }
        });
        pieceElement.addEventListener("dragend",function(e){
         draggedPiece =null;
         sourceSquare=null;
        });
        squareElement.appendChild(pieceElement);
    }

    squareElement.addEventListener("dragover",function(e){
    e.preventDefault();
    });
    squareElement.addEventListener("drop",function(e){
     e.preventDefault();
     if(draggedPiece){
        const targetSource ={
            row:parseInt(squareElement.dataset.row),
            col:parseInt(squareElement.dataset.col),
        };
        handleMove(sourceSquare,targetSource);
     }
    });
    boardElement.appendChild(squareElement);
})

});
if(playerRole === 'b'){
    boardElement.classList.add("flipped");
}
else{
    boardElement.classList.remove("flipped");

}
}

const handleMove =function(source,target){
const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion : 'q'
};
socket.emit("move",move);
}

const getPieceUnicode =function(piece){
    //chehare lane ke liye gode ki rani kei raja ki
    const unicodePieces ={
        p: '\u2659', // ♟ (Black Pawn)
        r: '\u265C', // ♜ (Black Rook)
        n: '\u265E', // ♞ (Black Knight)
        b: '\u265D', // ♝ (Black Bishop)
        q: '\u265B', // ♛ (Black Queen)
        k: '\u265A', // ♚ (Black King)
        P: '\u2659', // ♙ (White Pawn)
        R: '\u2656', // ♖ (White Rook)
        N: '\u2658', // ♘ (White Knight)
        B: '\u2657', // ♗ (White Bishop)
        Q: '\u2655', // ♕ (White Queen)
        K: '\u2654'  // ♔ (White King)
};
return unicodePieces[piece.type] || "";
}

socket.on("playerRole",function(role){
playerRole =role;
renderBoard();
});
socket.on("spectatorRole",function(){
    playerRole=null;
    renderBoard();
})

socket.on("boardState",function(fen){
chess.load(fen);
renderBoard();
});
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
    });

 renderBoard();