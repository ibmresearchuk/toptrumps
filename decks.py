import os
import csv
import random

decks = None





def getFileNameWithoutExtension(filename):
    return os.path.splitext(filename)[0]



def loadDeckData ():
    global decks

    decks = {}

    decknames = os.listdir("./data/decks")
    for deckname in decknames:
        attributes = []
        rules = {}
        cards = []

        with open("./data/decks/" + deckname, "rb") as csvfile:
            reader = csv.reader(csvfile)

            attributes = reader.next()

            idx = 0
            rulesrow = reader.next()
            for attribute in attributes:
                if attribute != "name" and attribute != "picture":
                    rules[attribute] = rulesrow[idx]
                idx += 1

            for row in reader:
                card = {}
                idx = 0
                for attribute in attributes:
                    if attribute != "name" and attribute != "picture":
                        card[attribute] = eval(row[idx])
                    else:
                        card[attribute] = row[idx]
                    idx += 1
                cards.append(card)

            decks[getFileNameWithoutExtension(deckname)] = { "rules" : rules, "cards" : cards }




def shuffleAndDeal (deck):
    allcards = deck["cards"][:]
    random.shuffle(allcards)
    half = len(allcards) / 2
    return allcards[:half], allcards[half:]



def list ():
    global decks
    if decks is None:
        loadDeckData()
    return map(getFileNameWithoutExtension, decks)

def get (deckname):
    global decks

    if decks is None:
        loadDeckData()

    if deckname in decks:
        return decks[deckname]

    return None





