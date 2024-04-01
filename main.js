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
    this.handsValue = 0;
  }
}

/*----- state variables -----*/
const decks = [];
const players = []; //switched from object to array to allow forEach function within
let checkDealerIdx = 0;

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
      card.value = Number(rank) || (rank === "A" ? 11 : 10); //all lettered cards are value 10 except A = 11.
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
  hideDealerHand();
}

//* draw card function works.
function drawCard(player) {
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

//* check value of cards, passed into object value.
function checkValue() {
  players.forEach((player) => {
    let totalValue = 0;
    let aceCount = 0;

    player.hands.forEach((card) => {
      totalValue += card.value;
      if (card.face.includes("A")) {
        aceCount += 1;
      }
      return totalValue;
    });

    if (player.hands.length === 2 && aceCount === 1 && totalValue === 21) {
      player.handsValue = -1; //assign -1 as doublewin
    } else if (player.hands.length === 2 && aceCount === 2) {
      player.handsValue = -2; //assign -2 as triplewin
    } else if (player.hands.length > 2 && aceCount > 0) {
      totalValue -= aceCount * 10;
      if (player.hands.length === 5 && totalValue < 22) {
        player.handsValue = -1; //assign -1 as doublewin
      } else {
        player.handsValue = totalValue;
      }
    } else {
      player.handsValue = totalValue;
    }
  });
}

//* check dealer function to call gamecheck.
function checkDealer() {
  //TODO pass function to reject check if totalvalue < 16.....

  checkDealerIdx += 1; //TODO not ideal if same player presses check more than once.
  if (checkDealerIdx === players.length - 1) {
    showDealerHand();
    console.log("dealer before", players[0].handsValue);
    while (players[0].handsValue > 0 && players[0].handsValue < 16 && players[0].hands.length < 5) {
      drawCard(players[0]); //TODO setTimeout doesnt work in this loop. becomes async. put timer and message? "dealer hand <15; draw1"
      console.log("dealer after", players[0].handsValue);
    }
    render();
    gameCheck();
  }
}

//* win lose conditions and print message
//TODO update bet wallet.
function gameCheck() {
  const dealerHandValue = players[0].handsValue;

  for (i = 1; i < players.length; i++) {
    const playerMessage = document.getElementById(`player${i}_msg`);

    //player draw conditions
    if (players[i].handsValue === dealerHandValue) {
      playerMessage.innerText = `${players[i].name} draw`;
    } else if (players[i].handsValue > 21 && dealerHandValue > 21) {
      playerMessage.innerText = `${players[i].name} draw`;
    }
    //player lose condition
    else if (players[i].handsValue > 21 && dealerHandValue < 22) {
      playerMessage.innerText = `${players[i].name} lose`;
    } else if (dealerHandValue > players[i].handsValue && dealerHandValue < 22) {
      playerMessage.innerText = `${players[i].name} lose`;
    } else if (dealerHandValue === -2) {
      playerMessage.innerText = `${players[i].name} lose triple`;
    } else if (dealerHandValue === -1) {
      playerMessage.innerText = `${players[i].name} lose double`;
    }
    //player win conditons
    else if (players[i].handsValue === -2) {
      playerMessage.innerText = `${players[i].name} Ace Pair, win triple`;
    } else if (players[i].handsValue === -1) {
      playerMessage.innerText = `${players[i].name} Ace/5cards, win double`;
    } else if (players[i].handsValue > dealerHandValue && players[i].handsValue < 22) {
      playerMessage.innerText = `${players[i].name} win`;
    } else if (dealerHandValue > 22 && players[i].handsValue < 22) {
      playerMessage.innerText = `${players[i].name} win`;
    }
    //incase i miss out any conditions
    else {
      console.log(`to add conditions: dealerHandValue, ${dealerHandValue} ; playerHandValue, ${players[i].handsValue}`);
    }
  }
}

//TODO reset function
//players.hands & totalvalue = 0 handsvalue = 0.
//deck reset.
//reset the hidden winlose message.
//dont update wallet.

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

  //display win/lose message after check.
  //needs it's own event listener to update.
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="players_msg" id="player${idx}_msg">win/lose message here</div>`);

  //* drawcard function works.
  const drawCardButton = document.createElement("button");
  drawCardButton.textContent = "Draw Card";
  drawCardButton.addEventListener("click", () => drawCard(players[idx]));

  //TODO create check buttons and function.
  const checkButton = document.createElement("button");
  checkButton.textContent = "Check";
  checkButton.addEventListener("click", () => checkDealer());

  newPlayerInterface.append(drawCardButton, checkButton);

  //   newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="bet"> show bet value: </div>`);

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
  checkValue();
}

initialise();
