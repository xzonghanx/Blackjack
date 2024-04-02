/*----- constants -----*/
const suits = ["s", "c", "d", "h"]; //amended to fit CSS Card Library
const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K", "A"];
class Player {
  constructor(name) {
    this.name = name;
    this.hands = []; //switched from object to array to allow forEach function within
    this.wallet = 100; //TODO enable topup function at start/in btw or kick players if value = 0.
    this.address = ""; //! not used yet
    this.bet = 0;
    this.cardAddress = ""; //used this for renderCardsInContainer()
    this.handsValue = 0;
    this.checked = false;
  }
}

/*----- state variables -----*/
const decks = [];
const players = []; //switched from object to array to allow forEach function within
let checkDealerIdx = 0;
let checkBetsPlacedIdx = 0;

/*----- cached elements  -----*/
const addPlayerInput = document.querySelector("#add_player");
const addButton = document.querySelector("#add_btn");
const startButton = document.getElementById("start_btn");
const dealButton = document.getElementById("deal_btn");
const displayPlayers = document.querySelector(".display_players");
const dealerMsg = document.querySelector(".dealer_msg");
const newRoundButton = document.getElementById("newRnd_btn");
const allButtons = document.querySelectorAll("button");

/*----- event listeners -----*/
addButton.addEventListener("click", handleAddPlayers);
startButton.addEventListener("click", initialRender);
dealButton.addEventListener("click", dealCard);
newRoundButton.addEventListener("click", newRound);

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

  disableDrawButtons();
  render();
  hideDealerHand();
}

//draw card function works.
function drawCard(player) {
  player.hands.push(nextCard());
  render();
}

//amended to work with additional cards
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

//check value of cards, passed into object value.
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

// to prevent check if value < 16.
//TODO add condition here to disable during place bet.
function checkToggle() {
  for (i = 1; i < players.length; i++) {
    const playerCheckButton = document.querySelector(`.player${i}_btn`);
    if (players[i].checked === true || (players[i].handsValue < 16 && players[i].handsValue >= 0)) {
      playerCheckButton.disabled = true;
    } else {
      playerCheckButton.disabled = false;
    }
  }
}

//check dealer function to call gamecheck.
function checkDealer() {
  checkDealerIdx += 1;

  if (checkDealerIdx === players.length - 1) {
    showDealerHand();
    console.log("dealer before", players[0].handsValue);
    let cardsDrawn = 0;
    while (players[0].handsValue > 0 && players[0].handsValue < 16 && players[0].hands.length < 5) {
      drawCard(players[0]);
      cardsDrawn += 1;
      dealerMsg.textContent = `dealer initial value <15, additional cards drawn ${cardsDrawn}`;
    }
    render();
    gameCheck();
  }
}

//win lose conditions and print message, update bet/wallet
function gameCheck() {
  const dealerHandValue = players[0].handsValue;

  for (i = 1; i < players.length; i++) {
    const playerMessage = document.getElementById(`player${i}_msg`);

    //bet amounts
    const betAmt = players[i].bet;
    players[i].bet = 0;

    //player draw conditions
    if (players[i].handsValue === dealerHandValue) {
      playerMessage.innerText = `${players[i].name} draw`;
      players[i].wallet += betAmt;
    } else if (players[i].handsValue > 21 && dealerHandValue > 21) {
      playerMessage.innerText = `${players[i].name} draw`;
      players[i].wallet += betAmt;
    }
    //player lose condition
    else if (players[i].handsValue > 21 && dealerHandValue < 22) {
      playerMessage.innerText = `${players[i].name} lose`;
    } else if (dealerHandValue > players[i].handsValue && dealerHandValue < 22 && players[i].handsValue > 0) {
      playerMessage.innerText = `${players[i].name} lose`;
    } else if (dealerHandValue === -2) {
      playerMessage.innerText = `${players[i].name} lose triple`;
      players[i].wallet -= betAmt * 2;
    } else if (dealerHandValue === -1) {
      playerMessage.innerText = `${players[i].name} lose double`;
      players[i].wallet -= betAmt;
    }
    //player win conditons
    else if (players[i].handsValue === -2) {
      playerMessage.innerText = `${players[i].name} Ace Pair, win triple`;
      players[i].wallet += betAmt * 4;
    } else if (players[i].handsValue === -1) {
      playerMessage.innerText = `${players[i].name} Ace/5cards, win double`;
      players[i].wallet += betAmt * 3;
    } else if (players[i].handsValue > dealerHandValue && players[i].handsValue < 22) {
      playerMessage.innerText = `${players[i].name} win`;
      players[i].wallet += betAmt * 2;
    } else if (dealerHandValue > 21 && players[i].handsValue < 22) {
      playerMessage.innerText = `${players[i].name} win`;
      players[i].wallet += betAmt * 2;
    }
    //incase i miss out any conditions
    else {
      console.log(`to add conditions: dealerHandValue, ${dealerHandValue} ; playerHandValue, ${players[i].handsValue}`);
    }

    const walletMsg = document.querySelector(`.player${i}_wallet`);
    walletMsg.innerText = `Player Wallet: $${players[i].wallet}`;

    newRoundButton.disabled = false;
  }
}

function placeBet(player, betAmt, idx) {
  checkBetsPlacedIdx += 1;
  player.bet = betAmt;
  player.wallet -= betAmt;
  const betMsg = document.querySelector(`.player${idx}_bet`);
  betMsg.innerText = `Bet Placed: $${player.bet}`;
  const walletMsg = document.querySelector(`.player${idx}_wallet`);
  walletMsg.innerText = `Player Wallet: $${player.wallet}`;
  allBetsIn();
  render();
}

function allBetsIn() {
  if (checkBetsPlacedIdx === players.length - 1) {
    dealButton.disabled = false;
    addButton.disabled = true;
    startButton.disabled = true;
  } else dealButton.disabled = true;
}

//reset game for new round
function newRound() {
  //reset state variables
  checkDealerIdx = 0;
  checkBetsPlacedIdx = 0;

  //reset buttons
  addButton.disabled = false;
  startButton.disabled = false;
  newRoundButton.disabled = true;
  const betButtons = document.querySelectorAll(".bet_buttons");
  betButtons.forEach((betButton) => {
    betButton.disabled = false;
  });

  //reset deck
  decks.splice(0, decks.length);
  for (i = 0; i < Math.round(players.length / 2); i++) {
    createDeck();
  }

  players.forEach((player) => {
    //reset cardcontainer
    player.cardAddress.innerHTML = "";
    //reset player properties except name,wallet,cardAddress
    player.hands = [];
    player.bet = 0;
    player.handsValue = 0;
    player.checked = false;
  });

  //reset dealer
  createDealer();
  //reset the hidden winlose message.
  ResetMessages();

  render();
}

function ResetMessages() {
  for (idx = 1; idx < players.length; idx++) {
    const betMsg = document.querySelector(`.player${idx}_bet`);
    betMsg.innerText = `Bet Placed: $${players[idx].bet}`;
    const walletMsg = document.querySelector(`.player${idx}_wallet`);
    walletMsg.innerText = `Player Wallet: $${players[idx].wallet}`;

    const playerMessage = document.getElementById(`player${idx}_msg`);
    playerMessage.textContent = "Min card value of 16 to check";

    dealerMsg.textContent = "";
  }
}

//TODO remove players. / or topup wallet

function handleAddPlayers() {
  if (addPlayerInput.value === "") {
    return;
  }
  const newPlayerName = addPlayerInput.value;
  const idx = players.length;
  players[idx] = new Player(`${newPlayerName}`);
  addPlayerInput.value = "";

  //create new section for each player added (to assign individual bet and wallet functions later)
  const newPlayerInterface = document.createElement("section");
  newPlayerInterface.className = `player_interface`;
  newPlayerInterface.id = `player${idx}`;
  displayPlayers.append(newPlayerInterface);
  players[idx].address = document.getElementById(`player${idx}`); //!not used yet

  //create card container for each player
  const newPlayerCardContainer = document.createElement("div");
  newPlayerCardContainer.innerHTML = `${newPlayerName} <div id = player${idx}_container></div>`;
  newPlayerInterface.append(newPlayerCardContainer);
  players[idx].cardAddress = document.getElementById(`player${idx}_container`);

  //drawcard function.
  const drawCardButton = document.createElement("button");
  drawCardButton.textContent = "Draw Card";
  drawCardButton.className = "draw_btn";
  drawCardButton.disabled = true;
  drawCardButton.addEventListener("click", () => drawCard(players[idx]));

  //checkbutton, enabled when cardvalue>15 or ACEs
  const checkButton = document.createElement("button");
  checkButton.textContent = "Check";
  checkButton.className = `player${idx}_btn`;
  checkButton.disabled = true;
  checkButton.addEventListener("click", () => {
    players[idx].checked = true;
    drawCardButton.disabled = true;
    render();
    checkDealer(players[idx]);
  });

  //display win/lose message after check.
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="players_msg" id="player${idx}_msg">Min card value of 16 to check</div>`);
  newPlayerInterface.append(drawCardButton, checkButton);

  //TODO create add money to wallet in initial
  const betInput = document.createElement("input");
  betInput.class = "bet_input";
  betInput.type = "number";
  betInput.placeholder = "Enter bet amount, min $1";

  const betButton = document.createElement("button");
  betButton.className = "bet_buttons";
  betButton.textContent = "Place Bet";
  betButton.addEventListener("click", () => {
    if (betInput.value < 1 || betInput.value > players[idx].wallet) {
      return;
    }
    placeBet(players[idx], parseInt(betInput.value), idx);
    betInput.value = "";
    betButton.disabled = true;
  });

  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="player${idx}_bet"> Bet Placed: $${players[idx].bet}</div>`);
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="player${idx}_wallet"> Player Wallet: $${players[idx].wallet}</div>`); //TODO change style inline with betamt.
  newPlayerInterface.append(betInput, betButton);

  startButton.disabled = false;
  //TODO disable the draw,check,placebet buttons initially.
}

function disableButtonsToStart() {
  allButtons.forEach((button) => (button.disabled = true));
  addButton.disabled = false;
}

function disableDrawButtons() {
  const drawButtons = document.querySelectorAll(".draw_btn");
  drawButtons.forEach((drawButton) => (drawButton.disabled = false));
  dealButton.disabled = true;
}

function initialise() {
  createDealer();
  disableButtonsToStart();
}

function initialRender() {
  for (i = 0; i < Math.round(players.length / 2); i++) {
    createDeck();
  }
  document.querySelectorAll(".player_interface").forEach((element) => (element.style.opacity = 1));
  addButton.disabled = true;
  startButton.disabled = true;
  render();
}

function render() {
  renderCardsInContainer();
  checkValue();
  checkToggle();
}

initialise();
