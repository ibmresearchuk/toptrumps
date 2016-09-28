import cherrypy
import os

# local
import bots
import decks
import training





class Root(object): pass


class Decks:
    exposed = True

    decks.list()

    @cherrypy.tools.accept(media="application/json")

    def GET(self, deckname=None):
        if deckname is None:
            return decks.list()

        deck = decks.get(deckname)
        if deck is None:
            cherrypy.response.status = 404
            return { "error" : "Unknown deck" }

        return deck



class Bots:
    exposed = True

    @cherrypy.tools.accept(media="application/json")

    def num(self, paramstring):
        try:
            return int(paramstring)
        except ValueError:
            return float(paramstring)

    def GET(self, botname=None, deckname=None, **params):
        if botname is None:
            cherrypy.response.status = 400
            return { "error" : "Listing all known bots is not supported" }

        if bots.isValidName(botname) == False:
            cherrypy.response.status = 400
            return { "error" : "Invalid bot name. Bot names can contain only letters or numbers and be 32 characters or less" }

        if deckname is None:
            return { "trainingcount" : bots.countBotTraining(botname) }

        deck = decks.get(deckname)
        rules = deck["rules"]
        expectedAttrs = rules.keys()
        cardvalues = {}
        for attr in expectedAttrs:
            if attr in cherrypy.request.params:
                cardvalues[attr] = self.num(cherrypy.request.params[attr])
            else:
                cherrypy.response.status = 400
                return { "error" : "Missing required attribute value", "name" : attr }

        return training.predict(botname, deckname, cardvalues)



    def PUT(self, botname=None, deckname=None):
        if botname is None:
            cherrypy.response.status = 400
            return { "error" : "Specific bot is required to train" }

        if bots.isValidName(botname) == False:
            cherrypy.response.status = 400
            return { "error" : "Invalid bot name. Bot names can contain only letters or numbers and be 32 characters or less" }

        if deckname is None:
            cherrypy.response.status = 400
            return { "error" : "Specify the deck to use for training" }

        deck = decks.get(deckname)
        if deck is None:
            cherrypy.response.status = 404
            return { "error" : "Unknown deck" }

        model = training.trainModel(botname, deckname)
        if model is None:
            cherrypy.response.status = 400
            return { "error" : "Unable to train" }

        trainingInfo = model["training"]
        trainingInfo["status"] = "complete"
        return trainingInfo




    def isValidPatch(self, patch):
        return "op" in patch and \
            "deck" in patch and \
            "value" in patch and \
            patch["op"] == "add" and \
            decks.get(patch["deck"]) is not None and \
            isinstance(patch["value"], list)


    @cherrypy.tools.accept(media="application/json")

    def PATCH(self, botname=None, aspect=None):
        if botname is None:
            cherrypy.response.status = 400
            return { "error" : "Specific bot is required to train" }

        if bots.isValidName(botname) == False:
            cherrypy.response.status = 400
            return { "error" : "Invalid bot name. Bot names can contain only letters or numbers and be 32 characters or less" }

        if aspect is None:
            cherrypy.response.status = 404
            return { "error" : "Not found" }

        if aspect != "training":
            cherrypy.response.status = 404
            return { "error" : "Not found" }

        patches = cherrypy.request.json
        if isinstance(patches, list) == False:
            cherrypy.response.status = 400
            return { "error" : "Invalid patch request payload" }

        for patch in patches:
            if self.isValidPatch(patch) == False:
                cherrypy.response.status = 400
                return { "error" : "Unsupported patch request payload" }

        bots.appendToTrainingData(botname, patch["deck"], patch["value"])

        cherrypy.response.status = 202
        return { }


class Games:
    exposed = True

    @cherrypy.tools.accept(media="application/json")

    def POST(self, deckname=None):
        if deckname is None:
            cherrypy.response.status = 400
            return { "error" : "Specify the deck to use for the new game" }

        deck = decks.get(deckname)
        if deck is None:
            cherrypy.response.status = 404
            return { "error" : "Unknown deck" }

        first, second = decks.shuffleAndDeal(deck)
        return { "deck" : deckname, "playerone" : first, "playertwo" : second }








if __name__ == "__main__":

    if not os.path.exists("./data/training"):
        os.makedirs("./data/training")

    apiconfig = {
        "/" : {
            "request.dispatch" : cherrypy.dispatch.MethodDispatcher(),
            "request.methods_with_bodies" : ("POST", "PUT", "PATCH"),
            "tools.response_headers.on" : True,
            "tools.response_headers.headers": [("Content-Type", "application/json")],
            "tools.gzip.on" : True,
            "tools.json_in.on" : True,
            "tools.json_out.on" : True
        }
    }
    uiconfig = {
        "/" : {
            "tools.staticdir.on" : True,
            "tools.staticdir.dir" : os.path.join(os.path.abspath(os.curdir), "static"),
            "tools.staticdir.index" : "index.html"
        }
    }

    cherrypy.tree.mount(Bots(), "/api/bots", apiconfig)
    cherrypy.tree.mount(Decks(), "/api/decks", apiconfig)
    cherrypy.tree.mount(Games(), "/api/games", apiconfig)

    ui = Root()
    cherrypy.tree.mount(ui, "/", uiconfig)
    cherrypy.tree.mount(ui, "/welcome", uiconfig)
    cherrypy.tree.mount(ui, "/botinfo", uiconfig)
    cherrypy.tree.mount(ui, "/duel", uiconfig)


    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("VCAP_APP_HOST", "0.0.0.0")
    cherrypy.config.update({
        "server.socket_port" : PORT,
        "server.socket_host" : HOST
    })

    print "Starting server on %s:%d" % (HOST, PORT)

    cherrypy.engine.start()
    cherrypy.engine.block()
