# external dependencies
from sklearn import tree
from timeit import default_timer as timer
from random import randint, sample, shuffle
from os.path import isfile
import os
import csv
import pylru
# local dependencies
import bots
import decks


# how many can we fit into memory?
ML_MODEL_CACHE_SIZE = 50

# cache of previously trained models in memory
models = pylru.lrucache(ML_MODEL_CACHE_SIZE)


#
# train a new model using the training data collected
#
def trainModel (botname, deckname):
    global models

    # start timing, so we know how long we're spending doing training
    start = timer()

    # get the path of the CSV with the training data
    trainingdata = bots.getFileName(botname, deckname)
    # no training data available
    if isfile(trainingdata) == False:
        return None

    # train a decision tree
    data = []
    target = []
    headers = None
    trainingrecords = 0
    with open(trainingdata, "rb") as trainingfile:
        reader = csv.reader(trainingfile, delimiter=",")
        headers = reader.next()
        for row in reader:
            data.append(row[:-1])
            target.append(row[-1])
            trainingrecords += 1

    dt = tree.DecisionTreeClassifier()
    dt.fit(data, target)

    # stop timing
    end = timer()

    # cache the decision tree so we can reuse it without training
    models[trainingdata] = dt

    return { "model" : dt, "training" : { "time" : (end - start), "hands" : len(data) } }


#
# gets the predictive model - fetching a previously trained model
#  if one is available in the cache, or creating a new one otherwise
def getModel (botname, deckname):
    global models
    trainingdata = bots.getFileName(botname, deckname)
    try:
        return models[trainingdata]
    except KeyError:
        newtraining = trainModel(botname, deckname)
        if newtraining is None:
            return None
        else:
            return newtraining["model"]



def compareNumbers (first, second):
    if first > second:
        return 1
    elif first < second:
        return -1
    else:
        return 0

def sortChoices (first, second):
    if first["outcome"] == 1 and second["outcome"] == 1:
        return compareNumbers(first["confidence"], second["confidence"])
    elif first["outcome"] == 1:
        return 1
    elif second["outcome"] == 1:
        return -1
    elif first["outcome"] == 0 and second["outcome"] == 0:
        return compareNumbers(second["confidence"], first["confidence"])
    elif first["outcome"] == 0:
        return 1
    elif second["outcome"] == 0:
        return -1
    else:
        return compareNumbers(second["confidence"], first["confidence"])


def randomChoice (rules):
    choice = sample(rules.keys(), 1)[0]
    print "Computer chose : %s" % (choice)
    return choice



def predict (botname, deckname, card):
    model = getModel(botname, deckname)

    deck = decks.get(deckname)
    rules = deck["rules"]

    if model is None:
        return { "confidence" : 0, "choice" : randomChoice(rules) }

    data = []

    optionidx = 0
    for option in rules.keys():
        optionData = []
        for attribute in rules.keys():
            optionData.append(card[attribute])
        optionData.append(optionidx)
        optionidx += 1

        data.append(optionData)

    predictions = model.predict_proba(data)

    print predictions

    if len(predictions) != len(rules.keys()):
        print "Insufficient training. Resorting to random."
        return { "confidence" : 0, "choice" : randomChoice(rules) }

    choices = []
    optionidx = 0
    for option in rules.keys():
        print option

        print len(predictions[optionidx])

        # we need predictions for win/loss/draw
        #  which only happen once all options have been
        #  represented in the training data
        if len(predictions[optionidx]) != 3:
            print "Insufficient training. Resorting to random."
            return { "confidence" : 0, "choice" : randomChoice(rules) }

        loss_prob = predictions[optionidx][0]
        draw_prob = predictions[optionidx][1]
        win_prob = predictions[optionidx][2]
        print "probability of losing " + str(predictions[optionidx][0])
        print "probability of drawing " + str(predictions[optionidx][1])
        print "probability of winning " + str(predictions[optionidx][2])
        if win_prob >= draw_prob and win_prob > loss_prob:
            choices.append({
                "choice" : option,
                "outcome" : 1,
                "confidence" : win_prob * 100
            })
        elif (draw_prob > win_prob and draw_prob > loss_prob) or (win_prob == loss_prob and win_prob > draw_prob):
            choices.append({
                "choice" : option,
                "outcome" : 0,
                "confidence" : draw_prob * 100
            })
        else:
            choices.append({
                "choice" : option,
                "outcome" : -1,
                "confidence" : loss_prob * 100
            })

        optionidx += 1

    sortedChoices = sorted(choices, cmp=sortChoices, reverse=True)

    choice = sortedChoices[0]["choice"]
    print "Computer chose : %s" % (choice)

    outcome = ""
    if sortedChoices[0]["outcome"] == 1:
        outcome = "win"
    elif sortedChoices[0]["outcome"] == 0:
        outcome = "at least draw"
    else:
        outcome = "draw"

    message = "(expecting that it would %s with %d percent confidence)"
    print message % (outcome, sortedChoices[0]["confidence"])

    return sortedChoices[0]



