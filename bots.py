from os.path import exists, isfile
from glob import glob

import re

import fileutils
import decks



BOTNAME_PATTERN = re.compile("^[A-Za-z0-9]{1,32}$")



def isValidName (botname):
    global BOTNAME_PATTERN
    return BOTNAME_PATTERN.match(botname) is not None


def getFileName (botname, deckname):
    return "./data/training/" + botname + "-" + deckname + ".csv"


def countBotTraining (botname):
    filenamepattern = "./data/training/" + botname + "-*.csv"

    training = {}

    trainingfiles = glob(filenamepattern)
    for trainingfile in trainingfiles:

        deckname = trainingfile[len("./data/training/" + botname + "-"):-(len(".csv"))]

        traininglines = fileutils.line_count(trainingfile)
        if traininglines > 1:
            training[deckname] = int((traininglines - 1) / 2)
        else:
            training[deckname] = 0

    return training


def appendToTrainingData (botname, deckname, newtraining):
    deck = decks.get(deckname)
    rules = deck["rules"]

    trainingfilepath = getFileName(botname, deckname)

    if isfile(trainingfilepath) == False:
        header = ""
        for attribute in rules.keys():
            header += "\"" + attribute + "\","
        header += "choice,outcome"

        with open(trainingfilepath, "a") as trainingfile:
            trainingfile.write(header + "\n")


    trainingline = ""

    for newtrainingdata in newtraining:
        for attribute in rules.keys():
            if attribute in newtrainingdata["card"]:
                trainingline += str(newtrainingdata["card"][attribute])
            else:
                trainingline += "0"
            trainingline += ","

        trainingline += str(rules.keys().index(newtrainingdata["choice"]))
        trainingline += ","

        trainingline += str(newtrainingdata["outcome"])
        trainingline += "\n"

    with open(trainingfilepath, "a") as trainingfile:
        trainingfile.write(trainingline)


