const functions = require('firebase-functions');
const Telegraf = require('telegraf');
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)
let db = admin.firestore()
const bot = new Telegraf(functions.config().bot.token);

bot.start((ctx) => {
    let docRef = db.collection('chats').doc((ctx.message.chat.id).toString());
    docRef.set({
        firstName: ctx.message.chat.first_name,
        lastName: ctx.message.chat.last_name,
        date: ctx.message.date
    });

    ctx.reply('Bem vindo ao lembrete para beber água 🥳')
})
bot.command('update', (ctx) => {
    let docRef = db.collection('chats').doc((ctx.message.chat.id).toString());
    docRef.set({
        firstName: ctx.message.chat.first_name,
        lastName: ctx.message.chat.last_name,
        date: ctx.message.date
    });

    ctx.reply('Dados atualizados 🔄')
})
bot.command('quit', (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id)

    // Using context shortcut
    ctx.leaveChat()
})
bot.launch();

exports.lembrete = functions.https.onRequest((request, response) => {
    const bot = new Telegraf.Telegram(functions.config().bot.token)

    db.collection('chats').get()
        .then(snapshot => {
            snapshot.forEach((doc) => {
                console.log(doc.id, '=>', doc.data());
                bot.sendMessage(
                    doc.id,
                    'Beba Água 🎉'
                );
            });
        })

    response.send("Lembretes Enviados");
});

exports.scheduledFunction = functions.pubsub
    .schedule('0 8-23/3 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun((context) => {
        let db = admin.firestore()
        const bot = new Telegraf.Telegram(functions.config().bot.token)
        const phrases = [
            'Beba Água 😉',
            'Já bebeu água hoje? 🤔',
            'Sabia que é importante se manter hidratado no calor? Beba mais água! 🎉'
        ]

        db.collection('chats').get()
            .then(snapshot => {
                snapshot.forEach((doc) => {
                    bot.sendMessage(
                        doc.id,
                        phrases[Math.floor(Math.random() * (phrases.length))]
                    );
                });
            })
    });