/*----- constants -----*/
const suits = ["s", "c", "d", "h"]; //amended to fit CSS Card Library
const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K", "A"];
class Player {
  constructor(name) {
    this.name = name;
    this.hands = []; //switched from object to array to allow forEach function within
    this.wallet = 100; //TODO bet.value by players.
    this.address = ""; //TODO to use later maybe.
    this.cardAddress = ""; //used this for renderCardsInContainer()
  }
}

/*----- state variables -----*/
const decks = [];
const players = []; //switched from object to array to allow forEach function within

/*----- cached elements  -----*/
const addPlayerInput = document.querySelector("#add_player");
const addButton = document.querySelector("#add_btn");
const startButton = document.getElementById("start_btn");
const dealButton = document.getElementById("deal_btn");
const displayPlayers = document.querySelector(".display_players");

/*----- event listeners -----*/
addButton.addEventListener("click", handleAddPlayers);
startButton.addEventListener("click", initialRender);
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
}

function createDealer() {
  players[0] = new Player("dealer");
  players[0].cardAddress = document.getElementById("dealer_container");
}

function nextCard() {
  let i = Math.floor(Math.random() * decks.length);
  const card = decks[i];
  decks.splice(i, 1);
  return card;
}

function dealCard() {
  for (i = 0; i < players.length; i++) {
    //number of players
    let idx = 0;
    while (idx < 2) {
      //2 cards each
      const drawn = nextCard();
      players[i].hands[idx] = drawn;
      idx++;
    }
  }
  render();
}

//* draw card function works.
function drawCard(player) {
  console.log(player);
  player.hands.push(nextCard());
  render();
}
//* amended to work with additional cards
function renderCardsInContainer() {
  players.forEach((player) =>
    player.hands.forEach((card) => {
      const collection = player.cardAddress.children;
      if (collection.length < player.hands.length) {
        player.cardAddress.insertAdjacentHTML("beforeend", `<div class="card ${card.face}"></div>`);
      } else {
        collection[player.hands.length - 1].className = `card ${card.face}`;
      }
    })
  );
}

function hideDealerHand() {
  const collection = players[0].cardAddress.children;
  collection[0].className = "card back";
}

function showDealerHand() {
  const collection = players[0].cardAddress.children;
  collection[0].className = `card ${players[0].hands[0].face}`;
}

function handleAddPlayers() {
  const newPlayerName = addPlayerInput.value;
  const idx = players.length;
  players[idx] = new Player(`${newPlayerName}`);
  addPlayerInput.value = "";

  //create new section for each player added (to assign individual bet and wallet functions later)
  const newPlayerInterface = document.createElement("section");
  newPlayerInterface.className = `player_interface`;
  newPlayerInterface.id = `player${idx}`;
  displayPlayers.append(newPlayerInterface);
  players[idx].address = document.getElementById(`player${idx}`);

  //create card container for each player
  const newPlayerCardContainer = document.createElement("div");
  newPlayerCardContainer.innerHTML = `${newPlayerName} <div id = player${idx}_container></div>`;
  newPlayerInterface.append(newPlayerCardContainer);
  players[idx].cardAddress = document.getElementById(`player${idx}_container`);

  //TODO testing method to amend HTML. can use for CSS later
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="controls"> show card value: </div>`);

  //TODO create game buttons for each player
  const drawCardButton = document.createElement("button");
  drawCardButton.textContent = "Draw Card";
  drawCardButton.addEventListener("click", () => drawCard(players[idx]));

  const checkButton = document.createElement("button");
  checkButton.textContent = "Check";
  //   checkButton.addEventListener("click", () => check(players[idx]));

  newPlayerInterface.append(drawCardButton, checkButton);

  //TODO testing method to amend HTML. can use for CSS later
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="bet"> show bet value: </div>`);

  //TODO create bet interface for each player
  const betInput = document.createElement("input");
  betInput.class = "bet_input";
  betInput.type = "number";
  betInput.placeholder = "Enter bet amount";

  const betButton = document.createElement("button");
  betButton.textContent = "Place Bet"; //TODO not sure if want to assign ID here. or link via players[idx]
  //   betButton.addEventListener("click", () => {placeBet(players[idx], parseInt(betInput.value))});

  newPlayerInterface.append(betInput, betButton);
}

function initialise() {
  createDealer();
}

function initialRender() {
  for (i = 0; i < Math.round(players.length / 2); i++) {
    createDeck();
  }
}

function render() {
  renderCardsInContainer();
  hideDealerHand();
  setTimeout(showDealerHand, 5000); //TODO check game condition: all players checked. then dealer display to show hand.
  console.log("rendered");
}

initialise();

//TODO bet MAX based on their wallet? or remove the wallet.
//TODO start game condition for deal(): all players bet input. else return msg.
//TODO display "turn" message. or green/red (ready.notready highlight/background of the userbox)
