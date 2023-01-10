# Volley Take Home Test


### **File Structure**

I modified the original starter kit to create the functionality for a self-defiend dice roll game.

```sh        
|- src
    |- index.ts # Handlers of invocation and intents
    |- db.ts # AWS SDK codes to store and manage persistent state in DynamoDB
    |- util
        |- secret.ts # Retrieve environment variables 
```

### **Demo on Alexa Echo Dot**
Invocation Name: my dice roll game <br/>
Demo Video: [Google Drive](https://drive.google.com/file/d/1332dD7eSlrF8H0enTtZhXXmkEBXRxOIg/view?usp=share_link)

### **Setting**
Lambda Runtime: Node.js 12.x <br/>
Database: DynamoDB


### **Possible Improvement**

1. ASK SDK v2 is not applicable with Node.js 18.x, need to upgrade to ASK SDK v3
1. Return more than 10 players if the top 10 scores include more than 10 players. (multiple players can have the same score).
2. Include more utterances in each intent.
3. Improve the fluency within sentences.
4. Write some tests.


