let board;
let playerScore = 0;
let aiScore = 0;
const results = document.querySelector('.results');
const body = document.getElementsByTagName('body');
var human = 'player';
var aiPlayer = 'ai';
let easy = false;

const winingCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
]

// Throwing random messages for Winning / Losing and Drawing
let winningMessages = [
  `Einstein couldn't been prouder`,
  `Yes! you did it, screenshot it and go brag about it`,
  `You won! wanna try again?`
]

let losingMessages = [
  `Yes! because you need a PhD from MIT to solve this one`,
  `No worries, it's ok... you can find a 3 Hours tutorial on youtube to solve it`,
  `Losing is not the end of the world, Try again`
]

let drawMessages = [
  `Oh yeah! my AI is so special he can hold you to a draw`,
  `Oh no! it's a Draw, try again!`,
  `Quote of the day: a Draw is a Loss`
]

const tiles = document.querySelectorAll('.board > div');
startGame()

function startGame() {
  results.style.display = 'none';
  results.classList.remove('player', 'ai');
  document.querySelector('.board').classList.remove('fademe');

  board = Array.from(Array(9).keys());

  Array.from(tiles).map((tile, index) => {
    // reset the board remove the X and Os
    tile.classList.remove('player', 'ai', 'win', 'loss', 'draw');

    //choosing the tile
    tile.addEventListener('click', turnClick, false);
  })
}

function turnClick(tile) {
  if (typeof board[tile.target.id] == 'number') {
    // Detect that the player clicked on a specific tile
    turn(tile.target.id, human);

    //Check if it's a draw stop AI from playing else AI will play
    if (!checkTie()) turn(bestSpot(), aiPlayer)
  }
}

function turn(tileId, winPlayer) {
  //Adding class to the tile chosen by the player
  board[tileId] = winPlayer;
  document.getElementById(tileId).classList.add(winPlayer);

  let gameWon = checkWin(board, winPlayer)
  if (gameWon) gameOver(gameWon)
}

function checkWin(board, winPlayer) {

  // Collecting player moves in a new arr
  let plays = board.reduce((arr, el, i) =>
    (el === winPlayer) ? arr.concat(i) : arr, []);

  let gameWon = null;

  // Comparing the player tiles with the wining tiles
  for (let [index, win] of winingCombos.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      gameWon = { index: index, winPlayer: winPlayer };
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (let index of winingCombos[gameWon.index]) {
    // Detect what player won and add Win/Loss class on the responsible Tiles
    gameWon.winPlayer == human ?
      document.getElementById(index).classList.add('win') :
      document.getElementById(index).classList.add('loss')
  }
  for (var i = 0; i < tiles.length; i++) {
    tiles[i].removeEventListener('click', turnClick, false);
  }

  results.classList.add(gameWon.winPlayer);

  if(gameWon.winPlayer == human){
    playerScore ++
  } else{
    aiScore++
  }
  document.querySelector('.playerscore').innerText = playerScore;
  document.querySelector('.aiscore').innerText = aiScore;  


  announceWinner(gameWon.winPlayer == human ?
    // Randomise the Win/Loss Message in the popup
    winningMessages[Math.floor(Math.random() * drawMessages.length)] :
    losingMessages[Math.floor(Math.random() * drawMessages.length)]
  );
}

//Showing the results
function announceWinner(whoIs) {
  results.style.display = 'block';
  document.querySelector('.board').classList.add('fademe');
  document.querySelector('.results h3').innerText = whoIs;
}

function emptyTiles() {
  return board.filter(emptyTile => typeof emptyTile == 'number')
}

// Detect the best spots for the AI playing a Random tile
function bestSpot() {
  if(easy){
    const availableTiles = emptyTiles();
    return availableTiles[Math.floor(Math.random() * availableTiles.length)];
  } else{
    return miniMax(board, aiPlayer).index;
  }
}

function playEasy(){
  easy = true;
}

function playHard(){
  easy = false;
}

function checkTie() {
  if (emptyTiles().length == 0) {
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].classList.add('draw');
      tiles[i].removeEventListener('click', turnClick, false)
    }

    // Choose a random Draw message
    announceWinner(drawMessages[Math.floor(Math.random() * drawMessages.length)])
    return true;
  }

  return false;
}


function miniMax(newBoard, player) {
	var availSpots = emptyTiles();

	if (checkWin(newBoard, human)) {
		return {score: -5};
	} else if (checkWin(newBoard, aiPlayer)) {
		return {score: 5};
	} else if (availSpots.length === 0) {
		return {score: 0};
	}
	var moves = [];
	for (var i = 0; i < availSpots.length; i++) {
		var move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player;

		if (player == aiPlayer) {
			var result = miniMax(newBoard, human);
			move.score = result.score;
		} else {
			var result = miniMax(newBoard, aiPlayer);
			move.score = result.score;
		}

		newBoard[availSpots[i]] = move.index;

		moves.push(move);
	}

	var bestMove;
	if(player === aiPlayer) {
		var bestScore = -10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		var bestScore = 10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}


// Use the keyboard arrows and Enter to fire the tiles
for (let i = 0; i < tiles.length; i++) {
  if (tiles[i].classList.contains('focused')) {
    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowRight':
          if (i < tiles.length - 1) {
            //Remove the focus class from the tile and add it on the next one
            tiles[i].classList.remove('focused');
            tiles[i].nextElementSibling.classList.add('focused');
            i++
          }
          break;

        case 'ArrowLeft':
          if (i > 0) {
            //Remove the focus class from the tile and add it on the previous one
            tiles[i].classList.remove('focused');
            tiles[i].previousElementSibling.classList.add('focused');
            i--
          }
          break;

        case 'ArrowDown':
          if (i < tiles.length - 3) {
            //Remove the focus class from the tile and jump 3 tiles forward
            tiles[i].classList.remove('focused');
            i += 3
            tiles[i].classList.add('focused');
          }
          break;

        case 'ArrowUp':
          if (i > 2) {
            //Remove the focus class from the tile and jump 3 tiles backward
            tiles[i].classList.remove('focused');
            i -= 3
            tiles[i].classList.add('focused');
          }
          break;
      }
      if (event.keyCode === 13) {
        //Trigger click on element
        tiles[i].click()
      }
    });
  }
}