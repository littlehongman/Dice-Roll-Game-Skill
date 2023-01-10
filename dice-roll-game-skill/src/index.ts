import * as Alexa from "ask-sdk";
import { escapeXmlCharacters } from "ask-sdk";
import { isIntent } from "./isIntent";
import { PersistenceAdapter } from 'ask-sdk-core';
import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter';

import { createRecord, getTopRecords } from './db'


const LaunchRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest" ||
      isIntent("HelloWorldIntent")(handlerInput)
    );
  },
  handle(handlerInput: Alexa.HandlerInput) {
    const speechText = "Welcome to the dice game! Do you want to roll the dice or listen to the ten highest scores?";

    const score = 0;
    handlerInput.attributesManager.setSessionAttributes({ score });

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const RollDiceIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("RollDiceIntent"),
  handle(handlerInput: Alexa.HandlerInput) {
    const roll = Math.floor(Math.random() * 6) + 1;
    let speechText = '';
    let score: number = handlerInput.attributesManager.getSessionAttributes().score || 0;

    if (roll === 1) {
        score = 0;
        speechText = "Oh no, you rolled a 1. Your score has been reset to 0. "
    } else {
        score += roll;
        speechText = `You rolled a ${roll}. Your current score is ${score}. `;
    }

    speechText += "Do you want to roll again or end the game?"

    handlerInput.attributesManager.setSessionAttributes({ score });

    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
  }
};


const EndGameIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("EndGameIntent", "AMAZON.CancelIntent", "AMAZON.StopIntent"),
  handle(handlerInput: Alexa.HandlerInput) {
    let speechText = "Game ended. Do you want to add your name to a high score list? "

    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
  }
}


const YesIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("AMAZON.YesIntent"),
  handle(handlerInput: Alexa.HandlerInput) {
    let speechText = "Great. What is your name?"

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
}

const NoIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("AMAZON.NoIntent"),
  handle(handlerInput: Alexa.HandlerInput) {
    let speechText = "OK. Hope you are having fun."

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
}

const NameIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("NameIntent"),
  async handle(handlerInput: Alexa.HandlerInput) {
    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'name');
    let score: number = handlerInput.attributesManager.getSessionAttributes().score || 0;

    await createRecord("RollDice", name, score);
    
    let speechText = `Congratulations ${name}. Your name is recorded in the list. See you again next time. `

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
}

const TopScoreIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("TopScoreIntent"),
  async handle(handlerInput: Alexa.HandlerInput) {
    const topScores = await getTopRecords();
    console.log(topScores);
    let speechText = "";
    let order = 1;

    for(const item of topScores){ // iterate top 10 scores
      speechText += `Number ${order}: ${item.Player}, ${item.Score} points. `;
      order += 1;
    }

    speechText += "Do you want to continue or do you want to end the game?"
    

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
}

const HelpIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("AMAZON.HelpIntent"),
  handle(handlerInput: Alexa.HandlerInput) {
    return handlerInput.responseBuilder
      .speak("Try saying hello!")
      .getResponse();
  },
};

const ErrorHandler : Alexa.ErrorHandler = {
  canHandle(handlerInput : Alexa.HandlerInput, error : Error ) : boolean {
    return true;
  },
  handle(handlerInput : Alexa.HandlerInput, error : Error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I don\'t understand your command. Please say it again.')
      .reprompt('Sorry, I don\'t understand your command. Please say it again.')
      .getResponse();
  }
};

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    EndGameIntentHandler,
    HelpIntentHandler,
    LaunchRequestHandler,
    RollDiceIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    NameIntentHandler,
    TopScoreIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
