class Commander {
  constructor(client, firebase) {
    this.firebase = firebase
    this.client = client
    this.cmds = [
      {
        cmd: '!ping',
        method: 'ping'
      },
      {
        cmd: '!test',
        method: 'test'
      },
      {
        cmd: '!add',
        method: 'addCommand'
      },
      {
        cmd: '!rm',
        method: 'rmCommand'
      },
      {
        cmd: '!comandos',
        method: 'allCommands'
      }
    ]

    this.load()
  }

  loadCmds() {
    const el = this
    const commandsLocal = this.cmds
    console.log(commandsLocal)
    return this.firebase
      .database()
      .ref('commands/')
      .once('value', function(snapshot) {
        el.cmds = el.cmds
        snapshot.forEach(s => {
          el.cmds.push(s.val())
        })
      })
  }

  load() {
    const el = this
    this.loadCmds()
      .then(() => {
        this.loadMessage()
        this.loadGuildMember()
      })
  }

  validate(command) {
    let stringCmd = command.split('!')
    stringCmd = `!${stringCmd[1]}`.trim()

    const findCommand = this.cmds.filter(c => c.cmd === stringCmd)[0]
    const response = {
      cmd: stringCmd,
      method: findCommand? findCommand.method : '',
      text: findCommand? findCommand.text : '',
      has: findCommand? true : false
    }

    return response
  }

  loadGuildMember() {
    this.client.on("guildMemberAdd", member => {
      const channel = member.guild.channels.find(
        channel => channel.name === process.env.CHANNEL_WELCOME
      );
    
      if (!channel) return;
    
      let slogan = "```"
      slogan += `
        +-+-+-+-+-+-+-+-+-+
        |T|h|e|M|o|r|p|h|z|
        +-+-+-+-+-+-+-+-+-+  
      `
      slogan += "```"
    
      channel.send(`
        ${slogan}
        ╚════════════════
          Bem vindo ao servidor do TheMorphz, ${member}!
        ╔════════════════
      `);
      member.addRole("550384948616495104");
    });
  }

  loadMessage() {
    const el = this
    this.client.on('message', message => {
      const context = message.content
      if (context.startsWith('!')) {
        const validate = this.validate(message.content)
        console.log(`Command sended: "${validate.cmd}", has function: ${validate.has}`)
        if(!validate.has) {
          return message.reply('Comando não existe!')
        }

        return el[validate.method](message, validate)
      }
    })
  }

  ping(message) {
    return message.reply(`Pong! Latency: ${this.client.ping}ms`)
  }

  test(message) {
    return message.reply(`This is a Test`)
  }

  allCommands(message) {
    let response = "Comandos disponiveis: "
    this.loadCmds()
      .then(() => {
        let cmds = [...new Set(this.cmds.map(c => c.cmd))]
        return message.reply(response + cmds.join(' - '))
      })
  }

  onlyText(message, validate) {
    this.firebase
      .database()
      .ref(`commands/${validate.cmd.slice(1)}`)
      .once('value', snap => {
        snap = snap.val()
        return message.reply(snap.text)
      })
  }

  rmCommand(message) {
    let secondCommand = message.content.split('!')
    secondCommand.splice(0, 2)

    this.firebase
      .database()
      .ref(`commands/${secondCommand}`)
      .remove()

    // Reload cmds
    this.cmds = this.cmds.filter((v, i) => {
      return v.cmd !== `!${secondCommand}`
    })
    message.reply(`Comando !${secondCommand} removido!`)
  }

  addCommand(message) {
    let secondCommand = message.content.split('!')
    secondCommand.splice(0, 2)
    secondCommand = secondCommand[0].split(' "')
    let text = secondCommand[1]
    text = text.slice(0, -1)
    secondCommand = secondCommand[0]

    this.firebase
      .database()
      .ref(`commands/${secondCommand}`)
      .set({
        cmd: `!${secondCommand}`,
        method: 'onlyText',
        text: text
      })

    message.reply(`Comando !${secondCommand} adicionado!`)
  }
}

module.exports = Commander