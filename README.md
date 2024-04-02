SEI Course Project 1: Blackjack

# userstory:

1. decide number of players (add)
2. input bet amount $$
3. players can start game (deal) cards.
4. player can see cards and decide to draw additional cards.
5. when done, player can check cards against dealer.
6. message to display win/lose/draw [win conditons (21, ACEs, 5cards)]
7. see wallet $$
8. player can reset to enter new game of cards.

# done

1. create deck (object with suit and value).
2. add dealer and players + group player by sections
3. randomise next card + update deck (remove from pile)
4. dealcard (dealer and player)
5. displaycard (dealer vs player)
6. hide/show dealerhand, only show 1 card
7. need to amended renderCard function to work with additional cards
8. draw card vs stay(check).
9. dealer draw vs stay condition.
10. win-lose conditions.
11. create and display message
12. function to reject check if playervalue < 16
13. improve checkdealer index to true/false by player.
14. message for dealer drawing cards

# to continue

15. reset deck, new game.
16. bet functions & wallet
17. bet MAX based on their wallet? topup $$.
18. start game condition for deal(): all players bet input. else return msg.
19. display "turn" message. or green/red (ready.notready highlight/background of the userbox)
20. CSS. add money stacks img.
