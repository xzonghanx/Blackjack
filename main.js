/*----- constants -----*/

//amended to fit CSS Card Library
const suits = ["s", "c", "d", "h"];
const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K", "A"];
const decks = [];
const players = []; //switched from object to array to allow forEach function within
class Player {
  constructor(name) {
    this.name = name;
    this.hands = []; //switched from object to array to allow forEach function within
    this.wallet = 100; //TODO bet.value by players
    this.address = ""; //TODO use this to get container render.
  }
}

/*----- state variables -----*/
let betValue = 0; //TODO by players

/*----- cached elements  -----*/
const addPlayerInput = document.querySelector("#add_player");
const addButton = document.querySelector("#add_btn");
const betInput = document.querySelector(".bet_input");
const betButton = document.querySelector("#bet_btn"); //from CSS Card library
const dealButton = document.getElementById("deal_btn");
const displayPlayers = document.querySelector(".display_players");
const dealerCont = document.getElementById("dealer_container"); //might not need this if render works

/*----- event listeners -----*/
addButton.addEventListener("click", handleAddPlayers);
betButton.addEventListener("click", getBetValue); //TODO by players
dealButton.addEventListener("click", dealCard);

/*----- functions -----*/

function createDeck() {
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      const card = { face: `${suit}${rank}` }; //amended to include face property to utilise CSS Card Library.
      card.value = Number(rank) || (rank === "A" ? 11 : 10); //can amend value later in win/lose conditions.
      decks.push(card);
    });
  });
  render();
}

function drawCard() {
  let i = Math.floor(Math.random() * decks.length);
  const card = decks[i];
  decks.splice(i, 1);
  return card; //
}
//this function is to draw additional cards
// players[0].hands.push(drawCard());

function dealCard() {
  for (i = 0; i < players.length; i++) {
    //number of players
    let idx = 0;
    while (idx < 2) {
      //2 cards each
      const drawn = drawCard();
      players[i].hands[idx] = drawn;
      idx++;
    }
  }
  render();
}

//adapted from CSS Card Library, create element in display based on no of card.
//TODO map out all players less the dealer. since dealer default class="card back", until check function.
function renderCardsInContainer() {
  players.forEach((player) =>
    player.hands.forEach((card) => {
      let cardsHtml = "";
      cardsHtml += `<div class="card ${card.face}"></div>`;
      player.address.innerHTML += cardsHtml;
    })
  );
}

//TODO amend this to only change dealer to "card_back"
function toggleDealerDisplay() {}

function getBetValue() {
  betValue = addPlayerInput.value;
  render();
}

function handleAddPlayers() {
  const newPlayerName = addPlayerInput.value;
  const idx = players.length;
  players[idx] = new Player(`${newPlayerName}`);
  addPlayerInput.value = "";

  //create element. cache the ID.
  //   displayPlayers.innerHTML += `<div class = "player${idx}"> ${newPlayerName} </div>`;
  const newPlayerContainer = document.createElement("div");
  //assign the container classes & id. i.e. dealer_container.
  newPlayerContainer.className = `player${idx}`;
  newPlayerContainer.innerHTML = `${newPlayerName} <div id = player${idx}_container></div>`;
  displayPlayers.append(newPlayerContainer);
  //pass address into modal
  players[idx].address = document.getElementById(`player${idx}_container`);

  render();
}

function createDealer() {
  players[0] = new Player("dealer");
  players[0].address = document.getElementById("dealer_container");
}

function initialise() {
  createDealer();
  console.log("initial", players);
  createDeck(); //TODO  pass this function multiple times depending on no of players. [roundup players.length /2]
}

function render() {
  console.log("rendered", players);
  renderCardsInContainer();
}

initialise();
