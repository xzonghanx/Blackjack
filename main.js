/*----- constants -----*/
const suits = ["s", "c", "d", "h"]; //amended to fit CSS Card Library
const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K", "A"];
class Player {
  constructor(name) {
    this.name = name;
    this.hands = []; //switched from object to array to allow forEach function within
    this.wallet = 100; //initial amount
    this.address = "";
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
let removedPlayersCount = 0;

/*----- cached elements  -----*/
const addPlayerInput = document.querySelector("#add_player");
const addButton = document.querySelector("#add_btn");
const startButton = document.getElementById("start_btn");
const dealButton = document.getElementById("deal_btn");
const displayPlayers = document.querySelector(".display_players");
const dealerMsg = document.querySelector(".dealer_msg");
const newRoundButton = document.getElementById("newRnd_btn");
const allButtons = document.querySelectorAll("button");
const rmPlayerList = document.querySelector("select");
const rmPlayerButton = document.getElementById("remove_player");
const muteButton = document.getElementById("mute_btn");
const audios = document.querySelectorAll(".bgmusic");

/*----- event listeners -----*/
addButton.addEventListener("click", handleAddPlayers);
startButton.addEventListener("click", initialRender);
dealButton.addEventListener("click", dealCard);
newRoundButton.addEventListener("click", newRound);
rmPlayerButton.addEventListener("click", removePlayer);
muteButton.addEventListener("click", muteVolume);

/*----- functions -----*/

//create deck from suits&ranks.
function createDeck() {
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      const card = { face: `${suit}${rank}` }; //amended to include face property to utilise CSS Card Library.
      card.value = Number(rank) || (rank === "A" ? 11 : 10); //from CSS Card Library: all lettered cards are value 10 except A = 11.
      decks.push(card);
    });
  });
}

//assign dealer as players[0]
function createDealer() {
  players[0] = new Player("dealer");
  players[0].cardAddress = document.getElementById("dealer_container");
}

//returns and removes random card from deck
function nextCard() {
  let i = Math.floor(Math.random() * decks.length);
  const card = decks[i];
  decks.splice(i, 1);
  return card;
}

//deals 2 card at game start
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
  //for game flow
  disableDrawButtons();
  for (j = 1; j < players.length; j++) {
    toggleBoxColour(j);
  }
  render();
  hideDealerHand();
  //exclude dealer
}

//draw 1 card
function drawCard(player) {
  player.hands.push(nextCard());
  render();
}

//amended to include else condition for additional drawn cards
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

//for game flow, hide 1 card
function hideDealerHand() {
  const collection = players[0].cardAddress.children;
  collection[0].className = "card back";
}
//for game flow, reveal faceddown card
function showDealerHand() {
  const collection = players[0].cardAddress.children;
  collection[0].className = `card ${players[0].hands[0].face}`;
}

//check value of cards, passed into Object(players) value.
function checkValue() {
  players.forEach((player) => {
    let totalValue = 0;
    let aceCount = 0;

    //account for ACEs
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
      totalValue -= aceCount * 10; //reassign ace value as 1 if cards>2
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
function checkToggle() {
  for (i = 1; i < players.length; i++) {
    try {
      const playerCheckButton = document.querySelector(`.player${i}_btn`);
      if (players[i].checked === true || (players[i].handsValue < 16 && players[i].handsValue >= 0)) {
        playerCheckButton.disabled = true;
      } else {
        playerCheckButton.disabled = false;
      }
    } catch (error) {
      console.error("error accessing DOM elements as players removed", error.message);
    }
  }
}

//await all players to 'check' before dealer turn (gamecheck).
function checkDealer() {
  checkDealerIdx += 1;

  if (checkDealerIdx === players.length - 1) {
    showDealerHand();
    let cardsDrawn = 0;
    while (players[0].handsValue > 0 && players[0].handsValue < 16 && players[0].hands.length < 5) {
      drawCard(players[0]);
      cardsDrawn += 1;
      dealerMsg.textContent = `Dealer initial value <15, Additional cards drawn: ${cardsDrawn}`;
    }
    gameCheck();
  }
}

//win/lose conditions and print message, update bet/wallet
function gameCheck() {
  const dealerHandValue = players[0].handsValue;

  for (i = 1; i < players.length; i++) {
    try {
      const playerMessage = document.getElementById(`player${i}_msg`);

      //bet amounts
      const betAmt = players[i].bet;

      //player draw conditions
      if (players[i].handsValue === dealerHandValue && players[i].hands.length < 5) {
        playerMessage.innerText = `${players[i].name} DRAW`;
        players[i].wallet += betAmt;
      } else if (players[i].handsValue > 21 && dealerHandValue > 21 && players[i].hands.length < 5) {
        playerMessage.innerText = `${players[i].name} DRAW`;
        players[i].wallet += betAmt;
      }
      //player lose condition
      else if (players[i].handsValue > 21 && players[i].hands.length >= 5 && dealerHandValue > 0) {
        playerMessage.innerText = `${players[i].name} Player 5Cards, LOSE Double`;
        players[i].wallet -= betAmt;
      } else if (players[i].handsValue > 21 && dealerHandValue < 22 && dealerHandValue > 0) {
        playerMessage.innerText = `${players[i].name} LOSE`;
      } else if (dealerHandValue > players[i].handsValue && dealerHandValue < 22 && players[i].handsValue > 0) {
        playerMessage.innerText = `${players[i].name} LOSE`;
      } else if (dealerHandValue === -2) {
        playerMessage.innerText = `${players[i].name} Dealer Ace Pair LOSE Triple`;
        players[i].wallet -= betAmt * 2;
      } else if (dealerHandValue === -1 && players[i].handsValue !== -2) {
        playerMessage.innerText = `${players[i].name} Dealer Ace/5Cards, LOSE Double`;
        players[i].wallet -= betAmt;
      }
      //player win conditons
      else if (dealerHandValue > 21 && players[0].hands.length >= 5 && players[i].handsValue > 0) {
        playerMessage.innerText = `${players[i].name} Dealer 5Cards, WIN Double`;
        players[i].wallet += betAmt * 3;
      } else if (players[i].handsValue === -2) {
        playerMessage.innerText = `${players[i].name} Ace Pair, WIN Triple`;
        players[i].wallet += betAmt * 4;
      } else if (players[i].handsValue === -1) {
        playerMessage.innerText = `${players[i].name} Ace/5cards, WIN Double`;
        players[i].wallet += betAmt * 3;
      } else if (players[i].handsValue > dealerHandValue && players[i].handsValue < 22) {
        playerMessage.innerText = `${players[i].name} WIN`;
        players[i].wallet += betAmt * 2;
      } else if (dealerHandValue > 21 && players[i].handsValue < 22) {
        playerMessage.innerText = `${players[i].name} WIN`;
        players[i].wallet += betAmt * 2;
      }
      //incase i miss out any conditions
      else {
        console.log(`to add conditions: dealerHandValue, ${dealerHandValue} ; playerHandValue, ${players[i].handsValue}`);
      }

      //update wallet amount shown in HTML
      const walletMsg = document.querySelector(`.player${i}_wallet`);
      walletMsg.innerHTML = `Player Wallet: $${players[i].wallet} <img class="cashstack_wallets" id="wallet${i}">`;

      newRoundButton.disabled = false;
    } catch (error) {
      console.error("error accessing DOM elements as players removed", error.message);
    }
  }
  render();
}

//retrive bet inputs and update HTML msg
function placeBet(player, betAmt, idx) {
  checkBetsPlacedIdx += 1;
  player.bet = betAmt;
  player.wallet -= betAmt;
  const betMsg = document.querySelector(`.player${idx}_bet`);
  betMsg.innerHTML = `Bet Placed: $${player.bet} <img class="cashstack_bets" id="bet${idx}">`;
  const walletMsg = document.querySelector(`.player${idx}_wallet`);
  walletMsg.innerHTML = `Player Wallet: $${player.wallet} <img class="cashstack_wallets" id="wallet${idx}">`;
  allBetsIn();
  render();
}

//check if all bets in to enable deal button.
function allBetsIn() {
  if (checkBetsPlacedIdx === players.length - 1) {
    dealButton.disabled = false;
    addButton.disabled = true;
    startButton.disabled = true;
    rmPlayerButton.disabled = true;
  } else dealButton.disabled = true;
}

//reset game for new round
function newRound() {
  //reset state variables
  checkDealerIdx = removedPlayersCount; //default 0
  checkBetsPlacedIdx = removedPlayersCount; //default 0

  //reset buttons
  addButton.disabled = false;
  startButton.disabled = false;
  newRoundButton.disabled = true;
  rmPlayerButton.disabled = false;
  const betButtons = document.querySelectorAll(".bet_buttons");
  betButtons.forEach((betButton) => {
    betButton.disabled = true;
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
  resetMessages();

  for (idx = 1; idx < players.length; idx++) {
    // toggleBoxColour(idx);
    const targetInterface = players[idx].address;
    targetInterface.style.boxShadow = "0 0 10px 5px rgba(0, 0, 0, 0.5)";
  }

  render();
}

//reset static HTML messages
function resetMessages() {
  for (idx = 1; idx < players.length; idx++) {
    try {
      const betMsg = document.querySelector(`.player${idx}_bet`);
      betMsg.innerHTML = `Bet Placed: $${players[idx].bet} <img class="cashstack_bets" id="bet${idx}">`;
      const walletMsg = document.querySelector(`.player${idx}_wallet`);
      walletMsg.innerHTML = `Player Wallet: $${players[idx].wallet} <img class="cashstack_wallets" id="wallet${idx}">`;

      const playerMessage = document.getElementById(`player${idx}_msg`);
      playerMessage.textContent = "Minimum card value of 16 to check";

      dealerMsg.textContent = "";
    } catch (error) {
      console.error("error accessing DOM elements as players removed", error.message);
    }
  }
}

function handleAddPlayers() {
  //create player, reject if name input is null
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
  players[idx].address = document.getElementById(`player${idx}`);

  //create card container for each player
  const newPlayerCardContainer = document.createElement("div");
  newPlayerCardContainer.innerHTML = `Player: ${newPlayerName} <div id = player${idx}_container></div>`;
  newPlayerInterface.append(newPlayerCardContainer);
  players[idx].cardAddress = document.getElementById(`player${idx}_container`);

  //drawcard function.
  const drawCardButton = document.createElement("button");
  drawCardButton.textContent = "Draw Card";
  drawCardButton.className = "draw_btn";
  drawCardButton.disabled = true;
  drawCardButton.addEventListener("click", () => {
    drawCard(players[idx]);
    if (players[idx].hands.length >= 5 || players[idx].handsValue > 20) {
      drawCardButton.disabled = true;
    }
  });

  //checkbutton, enabled when cardvalue>15 or ACEs
  const checkButton = document.createElement("button");
  checkButton.textContent = "Check";
  checkButton.className = `player${idx}_btn`;
  checkButton.disabled = true;
  checkButton.addEventListener("click", () => {
    players[idx].checked = true;
    drawCardButton.disabled = true;
    checkDealer(players[idx]);
    toggleBoxColour(idx);
    render();
  });

  //display win/lose message after check.
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="players_msg" id="player${idx}_msg">Minimum card value of 16 to check</div>`);
  newPlayerInterface.append(drawCardButton, checkButton);

  //create bet form to use validation msg
  const betForm = document.createElement("form");
  //create bet input and buttons
  const betInput = document.createElement("input");
  betInput.type = "number";
  betInput.placeholder = "Enter bet amount, min $1";
  betInput.required = true;

  const betButton = document.createElement("button");
  betButton.className = "bet_buttons";
  betButton.textContent = "Place Bet";
  betButton.disabled = true;

  //retrieve bet input and pass Bet into GameCheck
  betButton.addEventListener("click", () => {
    if (betInput.value < 1 || betInput.value > players[idx].wallet) {
      betInput.setCustomValidity("Bet amount invalid OR insufficient funds in wallet");
      return;
    } else {
      betInput.setCustomValidity("");
    }
    placeBet(players[idx], parseInt(betInput.value), idx);
    betInput.value = "";
    betButton.disabled = true;
    toggleBoxColour(idx);
    render();
  });

  betForm.appendChild(betInput);
  betForm.appendChild(betButton);

  //display wallet and bet amount
  //added cashstack messages
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="player${idx}_wallet"> Player Wallet: $${players[idx].wallet} <img class="cashstack_wallets" id="wallet${idx}"> </div> `);
  newPlayerInterface.insertAdjacentHTML("beforeend", `<div class="player${idx}_bet"> Bet Placed: $${players[idx].bet} <img class="cashstack_bets" id="bet${idx}"></div> `);
  newPlayerInterface.append(betForm);

  //for game flow
  startButton.disabled = false;
  //for removeplayer
  rmPlayerList.insertAdjacentHTML("beforeend", `<option value=${idx}> ${players[idx].name} </option>`);
}

//CashStack Imgs for wallet&bet; amended Msgs to include cashstack in each HTML render
function renderCashStackWallet() {
  const cashStacksWallets = document.querySelectorAll(".cashstack_wallets");
  cashStacksWallets.forEach((cashstack) => {
    //obtain the index from the string using match digits and parseInt)
    let stackIdx = parseInt(cashstack.id.match(/\d+/)[0]);
    let stack = 0;
    stack = players[stackIdx].wallet;
    checkCashStack(stack);
    cashstack.className = `cashstack_wallets ${checkCashStack(stack)}`;
  });
}
function renderCashStackBets() {
  const cashStacksBets = document.querySelectorAll(".cashstack_bets");
  cashStacksBets.forEach((cashstack) => {
    //obtain the index from the string using match digits and parseInt)
    let stackIdx = parseInt(cashstack.id.match(/\d+/)[0]);
    let stack = 0;
    stack = players[stackIdx].bet;
    checkCashStack(stack);
    cashstack.className = `cashstack_bets ${checkCashStack(stack)}`;
  });
}

//return different stack images based on value
function checkCashStack(stack) {
  if (stack === 1) {
    return "icon1";
  } else if (stack === 2) {
    return "icon2";
  } else if (stack === 3) {
    return "icon3";
  } else if (stack === 4) {
    return "icon4";
  } else if (stack === 5) {
    return "icon5";
  } else if (stack > 5 && stack < 15) {
    return "icon6";
  } else if (stack >= 15 && stack < 25) {
    return "icon7";
  } else if (stack >= 25 && stack < 50) {
    return "icon8";
  } else if (stack >= 50 && stack < 100) {
    return "icon9";
  } else if (stack >= 100) {
    return "icon10";
  }
}

//for game flow
function disableButtonsToStart() {
  allButtons.forEach((button) => (button.disabled = true));
  addButton.disabled = false;
  rmPlayerButton.disabled = false;
  muteButton.disabled = false;
}
//for game flow
function disableDrawButtons() {
  const drawButtons = document.querySelectorAll(".draw_btn");
  drawButtons.forEach((drawButton) => (drawButton.disabled = false));
  dealButton.disabled = true;
}

//* cannot remove existing players as it changes the count of idx with players[idx] and player_id
//* used try-catch to circumvent errors with missing DOM elements after players are removed.
function removePlayer() {
  const idx = rmPlayerList.value;
  const playerCont = document.querySelector(".display_players"); //find the container to remove.
  playerCont.removeChild(players[idx].address); //remove player from display
  rmPlayerList.remove(idx); //remove player from SELECT LIST
  console.log("rmplayerlist text", rmPlayerList.innerText);
  console.log("idx", idx);
  console.log(players);
  removedPlayersCount += 1;
  checkDealerIdx += 1;
  checkBetsPlacedIdx += 1;
}

//show ready-state for player
function toggleBoxColour(idx) {
  const targetInterface = players[idx].address;
  const currentColour = window.getComputedStyle(targetInterface).boxShadow;
  if (currentColour.includes("rgba(0, 0, 0, 0.5)")) {
    targetInterface.style.boxShadow = "0 0 10px 5px rgba(255, 0, 0, 0.5)";
  } else if (currentColour.includes("rgba(255, 0, 0, 0.5)")) {
    targetInterface.style.boxShadow = "0 0 10px 5px rgba(0, 255, 76, 0.5)";
  } else if (currentColour.includes("rgba(0, 255, 76, 0.5)")) {
    targetInterface.style.boxShadow = "0 0 10px 5px rgba(255, 0, 0, 0.5)";
  }
}

//mute/unmute both audioclips and toggle volume icons
function muteVolume() {
  //toggles muted satte, if audio.muted is true, it sets to false, and vice versa.
  audios.forEach((audio) => (audio.muted = !audio.muted));
  //check based on first audio in audios array (cannot directly use .muted on audios array)
  //if audio.muted is true, then it sets innerHTML to volume_off; if false; then sets to volume_up. *Ternary Operator*
  muteButton.innerHTML = audios[0].muted ? `<i class="material-icons" style = "font-size: 12px">volume_off</i>` : `<i class="material-icons" style = "font-size: 12px">volume_up</i>`;
}

function initialise() {
  createDealer();
  disableButtonsToStart();
}

function initialRender() {
  //reset deck, then create deck based on no of players.
  decks.splice(0, decks.length);
  for (i = 0; i < Math.round(players.length / 2); i++) {
    createDeck();
  }
  //for game flow
  document.querySelectorAll(".player_interface").forEach((element) => (element.style.opacity = 1));
  addButton.disabled = true;
  startButton.disabled = true;
  rmPlayerButton.disabled = true;

  const betButtons = document.querySelectorAll(".bet_buttons");
  betButtons.forEach((betButton) => {
    betButton.disabled = false;
  });

  for (idx = 1; idx < players.length; idx++) {
    toggleBoxColour(idx);
  }

  renderCashStackWallet();
}

function render() {
  renderCardsInContainer();
  checkValue();
  checkToggle();
  renderCashStackWallet();
  renderCashStackBets();
}

initialise();
