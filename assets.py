from typing import List
# from db import Session, AdvCard_db, development_url, Credits_db, CreditTo_db, Text_db

# civ info
civs = [
    {'name': 'minoa', 'color': '#7cdc24', 'ast': 1},
    {'name': 'saba', 'color': '#eb7615', 'ast': 2},
    {'name': 'assyria', 'color': '#92ccdc', 'ast': 3},
    {'name': 'maurya', 'color': '#ff0000', 'ast': 4},
    {'name': 'celt', 'color': '#05a714', 'ast': 5},
    {'name': 'babylon', 'color': '#a6a6a6', 'ast': 6},
    {'name': 'carthage', 'color': '#e8a808', 'ast': 7},
    {'name': 'dravidia', 'color': '#6a2d97', 'ast': 8},
    {'name': 'hatti', 'color': '#ff66cc', 'ast': 9},
    {'name': 'kushan', 'color': '#663300', 'ast': 10},
    {'name': 'rome', 'color': '#ff0066', 'ast': 11},
    {'name': 'persia', 'color': '#990099', 'ast': 12},
    {'name': 'iberia', 'color': '#eaeaea', 'ast': 13},
    {'name': 'nubia', 'color': '#44aaaa', 'ast': 14},
    {'name': 'hellas', 'color': '#ffff00', 'ast': 15},
    {'name': 'indus', 'color': '#008000', 'ast': 16},
    {'name': 'egypt', 'color': '#ffffcc', 'ast': 17},
    {'name': 'parthia', 'color': '#666633', 'ast': 18}
]

# adv card colors
adv_colors = {'orange': '#ee8222',
'yellow': '#f7cb0d',
'red': '#ec232e',
'blue': '#0070b5',
'green': '#40b24c',}

# adv card raw info
advancement_cards = [
    {'name': 'architecture', 'price': 140, 'pgroup': 'blue', 'credit_to': {'name': 'mining', 'amount': 20}, 'credits': {'blue': 10, 'green': 5}, 'texts': 'once per turn, wehn constructing a city you may choose to pay up to half of the required cost from treasury.'},
    {'name': 'cloth making', 'price':50, 'pgroup': 'orange', 'credit_to': {'name': 'naval warfare', 'amount': 10}, 'credits': {'blue': 5, 'orange': 10}, 'texts': 'your ships are allowed to move 5 steps.'},
    {'name': 'diaspora', 'price': 270, 'pgroup': 'yellow', 'credits': {'blue': 5, 'yellow': 20}, 'texts': '#special-ability: you may choose to take up to 5 of yout tokens from the board and place them anywhere on the board, providing that no population limits are exceeded.'},
    {'name': 'diplomacy', 'price': 160, 'pgroup': 'blue', 'credit_to': {'name': 'provincial empire', 'amount': 20}, 'credits': {'blue': 10, 'red': 5}, 'texts': 'players are not allowed to move tokens into areas containing your cities, except for areas where a conflict situation already occurs. this does not count for players holding diplomacy or military. #treachery: the beneficiary selelcts and annexes 1 additional city.'},
    {'name': 'mining', 'price': 230, 'pgroup': 'orange', 'credits': {'orange': 20, 'green': 5}, 'texts': 'during the trade cards acquisition phase, you may acquire additional trade cards from stack 6 and/or stack 8 for 13 treasury tokens per card. treasury tokens are worth 2 points when purchasing civilization advances. #slave-revolt your city support rate is increased by 1 during the resolution of slave revolt.'},
    {'name': 'monument', 'price': 180, 'pgroup': 'orange', 'sgroup': 'yellow', 'credit_to': {'name': 'wonder of the world', 'amount': 20}, 'credits': {'orange':10, 'yellow': 10}, 'texts': '#tokens: 20'},
    {'name': 'mysticism', 'price': 50, 'pgroup': 'blue', 'sgroup': 'yellow', 'credit_to': {'name': 'monument', 'amount': '10'}, 'credits': {'blue': 5, 'yellow': 5}, 'texts': '#superstition: reduce 1 less city.'},
    {'name': 'naval warfare', 'price': 160, 'pgroup': 'red', 'credit_to': {'name': 'diaspora', 'amount': 20}, 'credits': {'red': 10, 'orange': 50}, 'texts': 'your ships are allowed to carry 6 tokens. in conflicts, you may choose to remove ships from the conflict area instead of tokens. after each round of token removal a new check for token majority must be made. #piracy: if you are the primary victim, the beneficiary selects and replaces 1 less coastal city. you may not be selected as a secondary victim. #civil-disorder: reduce 1 additional city.'},
    {'name': 'provincial empire', 'price': 260, 'pgroup': 'red', 'credits': {'yellow': 5, 'red': 20}, 'texts': '#sepcial-ability: you may choose to select up to 5 players that have units adjacent by land or water to your units. these players must choose and give you a commodity card with a face value of at least 2. players holding provinicial empire or public works may not be selected. #barbarian-hords: 5 additional barbarian tokens used. #tyranny: the beneficiary selects and annexes 5 additional unit points.'},
    {'name': 'sculpture', 'price': 50, 'pgroup': 'blue', 'credit_to': {'name': 'architecture', 'amount': 10}, 'credits': {'blue': 10, 'red': 5}, 'texts': '#tyranny: the benneficiary selects and annexes 5 less points.'},
    {'name': 'urbanism', 'price': 50, 'pgroup': 'red', 'credit_to': {'name':'diplomacy', 'amount':10}, 'credits': {'red': 10, 'green':5},'texts': 'once per turn, when constructing a wilderness city you may choose to use up to 4 tokens from areas adjacent by land.'},
    {'name': 'wonder of the world', 'price': 290, 'pgroup': 'blue', 'sgroup': 'orange', 'credits': {'blue': 20, 'orange': 20}, 'texts': 'during the trade cards acquisition phase, you may acqure 1 additional trade card for free from a stack number that is 1 higher than your number of cities in play. wonder of the world counts as a city during the a.s.t.-alteration phase. #corruption: discard 5 additional points of face vvalue.'},
    {'name': 'mathematics', 'price': 250,'pgroup': 'blue', 'sgroup': 'green', 'credits': {'blue':20, 'red':10, 'orange':10, 'yellow':10, 'green':20}, 'texts': ''},
    {'name': 'literacy', 'price': 110, 'pgroup': 'blue', 'sgroup':'red', 'credit_to': {'name': 'mathematics', 'amount': 20}, 'credits': {'blue': 10, 'red': 10, 'orange':5, 'yellow': 5, 'green': 5}, 'texts': ''},
    {'name': 'mythology', 'price': 60, 'pgroup': 'yellow', 'credit_to': {'name': 'literacy', 'amount': 10}, 'credits': {'blue':5, 'yellow':10}, 'texts': '#slave-revolt: your city support rate is decreased by 1 during the resolution of slave revolt.'},
    {'name': 'roadbuilding', 'price': 220, 'pgroup': 'orange', 'credits': {'orange': 20, 'green': 5}, 'texts': 'when moving over land, your tokens may move 2 areas. tokens that are in a conflict situation after one strp are not allowed to move further. your hand limit of trade cards is increased by 1. #epidemic: if you are the primary victim, take 5 additional damage.'},
    {'name': 'engineering', 'price': 160, 'pgroup': 'orange', 'sgroup': 'green', 'credit_to': {'name': 'roadbuildiing', 'amount': 20}, 'credits': {'orange': 10, 'green': 10}, 'texts': 'other players require 8 tokens to successfully attack your cities. your cities are then replaced by 7 tokens. this does not apply when the attacking player also holds engineering. you require 6 tokens to successfully attack other player\'s cities. their cities are then replaced by 5 tokens. this does not apply when the defending player also holds engineering. #earthquake: your city is reduced instead of destroyed. #flood: prevent 5 damage.'},
    {'name': 'masonry', 'price': 60, 'pgroup': 'orange', 'credit_to': {'name':'engineering', 'amount':10}, 'credits': {'orange': 10, 'green':5}, 'texts': '#cyclone: reduce 1 less of your selected cities.'},
    {'name': 'democracy', 'price': 220, 'pgroup': 'red', 'credits': {'blue': 5, 'red': 20}, 'texts': 'during the tax collection phase you collect tax as usual but your cities do not revolt as a result of shortage in tax collection. #civil-war: select 10 less points #civil-disorder: reduce 1 less city.'},
    {'name': 'agricutlure', 'price': 120, 'pgroup': 'orange', 'credit_to': {'name':'democracy', 'amount':20}, 'credits': {'orange': 10, 'green': 5}, 'texts': 'the population limits of 0, 1 and 2 areas on the board are increased by 1 for you as long as these areas do not contain any other player\'s units or barbarian tokens. #famine: if you are the primary victim, take 5 additional damage.'},
    {'name': 'pottery', 'price': 60, 'pgroup': 'orange', 'credit_to': {'name': 'agriculture', 'amount': 10}, 'credits': {'blue': 5, 'orange': 10}, 'texts': '#famine: prevent 5 damage.'},
]

if __name__ == '__main__':
    ...
