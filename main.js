/*----- constants -----*/
const suits = ["spades", "hearts", "clubs", "diamonds"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const decks = [];
const players = {};

class Player {
  constructor(name) {
    this.name = name;
    this.hands = {};
    this.wallet = 100; //TODO bet.value by players
  }
}

/*----- state variables -----*/
let betValue = 0; //TODO by players

/*----- cached elements  -----*/
const addPlayerInput = document.querySelector("#add_player");
const addButton = document.querySelector("#add_btn");
const betInput = document.querySelector(".bet_input");
const betButton = document.querySelector("#bet_btn");

/*----- event listeners -----*/
addButton.addEventListener("click", handleAddPlayers);
betButton.addEventListener("click", getBetValue); //TODO by players

/*----- functions -----*/
function createDeck() {
  suits.forEach((suit) => {
    values.forEach((value) => {
      const card = { suit, value };
      decks.push(card);
    });
  });
  render(); //TODO see if need to assign card ID to use with CSS photos
}

function drawCard() {
  let i = Math.floor(Math.random() * decks.length); //deck.length changes.
  const card = decks[i];
  decks.splice(i, 1);
  return card; // render() here or?? not here because i need to use this value. or render() only for DOM elements
}

function dealCard() {
  for (i = 0; i < Object.entries(players).length; i++) {
    let idx = 0;
    while (idx < 2) {
      const drawn = drawCard();
      players[i].hands[idx] = drawn;
      idx++;
    }
  }
  render();
}

function getBetValue() {
  betValue = addPlayerInput.value;
  render();
}

function handleAddPlayers() {
  const newPlayerName = addPlayerInput.value;
  const idx = Object.entries(players).length;
  players[idx] = new Player(`${newPlayerName}`);
  addPlayerInput.value = "";
  render();
}

function initialise() {
  players[0] = new Player("dealer");
  createDeck(); //TODO  pass this function multiple times depending on no of players
}

function render() {
  console.log("rendered", players);
}

initialise();
console.log("initial", players);

// dealCard();
