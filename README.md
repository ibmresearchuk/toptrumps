# toptrumps
## Simple child's demo of machine learning - train a bot to play Top Trumps

![screenshot](https://raw.githubusercontent.com/ibmets/toptrumps/master/screenshot.png)

###What is this?
This was inspired by the game <a href="https://en.wikipedia.org/wiki/Top_Trumps">Top Trumps</a> that I used to play as a kid. It's an online version where you play against the computer.

But the computer hasn't been given any instructions on how to play, and has to learn from you.

Initially, it makes random choices, but it learns from playing against you. The more turns it plays, the better it gets at making a prediction of which choice would give it the best chance of winning.

Before long, it should get very good - always making the best possible choice for any card.

###What is the point of this?
It was written as a quick and simple demo of machine learning for primary school children.

The aim is to give you a first-hand experience in training a machine learning system, by letting you train it to play a simple game that you're hopefully already familiar with.

The aim is to explain that there is another approach to the "programming means giving computers a list of steps to follow" concept introduced in schools. I want to introduce you to the idea that sometimes we get computers to do something by giving it examples of the job we want it to do. 

###Does this mean you think kids don't need to be taught how to code?
No.

I absolutely think that's important, and have been trying to help with that as a <a href="http://dalelane.co.uk/blog?s=code+club">Code Club volunteer</a> for years.

This is about adding to that, for extra awesome.

###Do children need to know about machine learning?
I think so.

It's part of understanding how the world around you works.

I'm not saying I think all 9 year olds should be able to code a neural network from first principles. But when you see recommendations on Netflix for what you might like to watch next, I do think it's good to have a basic understanding of how that works, and how the ratings you give might have played into that.

I've talked about this a lot <a href="http://dalelane.co.uk/blog/?p=3211">here</a>, <a href="http://dalelane.co.uk/blog/?p=3299">here</a> and <a href="http://dalelane.co.uk/blog/?p=3330">here</a>.

###Machine learning is a very broad term. How does this actually work?
It's using a decision tree classifier (see <a href="https://en.wikipedia.org/wiki/Decision_tree_learning">Wikipedia for a good summary</a> of what that means) trained on the attributes of a card, the choice of attribute made by the player, and the outcome (win/draw/lose).

It felt like a reasonably good fit for this sort of job, plus it's super quick and easy to make.

###Why English kings and queens?
I wanted it to be educational and this was the first idea I had. 

The data all came from Wikipedia so I think it's accurate. (If it's not, it's most likely that I messed something up when I was doing that).

I've made it very easy to add new themed decks of cards. All the card data and rules for the deck comes from <a href="https://github.com/ibmets/toptrumps/blob/master/data/decks/kingsandqueens.csv">a CSV file</a>. Adding other CSV files with different card data to this folder will make it possible to play the game with different topics.

I'm thinking of adding a food based deck - with each card being a different meal or type of food, and different nutritional values as the attributes.

If you think of any other themes that would be good to do, let me know. Or even better, send me a pull request with a new CSV file to drop in!

###Couldn't you do this with other games besides Top Trump?
Absolutely! I've done some other examples of this, like <a href="http://dalelane.co.uk/blog/?p=3330">Guess Who</a> and <a href="http://dalelane.co.uk/blog/?p=3349">Rock, Paper, Scissors</a>.

There are several others I think would work well, too. And I'm definitely open to suggestions for more.

###Is my training data super private?
No, sorry.

I've got no authentication here, so anyone else who knows your bot's name can play against it and add to it's training. If that concerns you, then you could use a random 32-character alphanumeric. But this was really just meant to be an educational toy, so I wouldn't worry about it.

###Is my training data super safe and secure?
No. Sorry, again.

I'm not making any guarantees to guard your training data for ever and ever. I don't have plans to trash things, but if you really need to know that your training data will be kept safe then you could run the app yourselves. <a href="https://github.com/ibmets/toptrumps/blob/master/INSTALL.md">Instructions for doing that are here</a>. 

But, again... this is just supposed to be a toy!
