// Import discord.js and other modules
const Discord = require("discord.js");
const util = {
    input: require("./util/input.js"),
    time: require("./util/time.js")
};

// Load in config
const config = require("../config.json");

// Import random strings
const daniel = {
    part1: require("../res/random/part1.json"),
    part2: require("../res/random/part2.json"),
    part3: require("../res/random/part3.json")
};

// Reply with "Hi ..., I'm Dad!" randomly if message begins with "I'm"
function checkImDad(msg) {
    // Separate potential I'm from sentence
    const words = msg.content.trim().split(/ +/g);
    const word = words.shift().toLowerCase();

    if (word === "i'm" || word === "im") {
        const rand = Math.floor(Math.random() * 101);
        if (rand <= config.dadChance) {
            console.log(`[${util.time.getDateTimeString()}] 'I'm Dad' fired`)
            msg.channel.send(`Hi ${words.join(" ")}, I'm Dad!`);
        }
    }
}

// Reply with 'yes we can' meme if first word it "this?"
function checkYesWeCan(msg) {
    const word = msg.content.trim().split(/ +/g).shift().toLowerCase();
    if (word === "this?") {
        console.log(`[${util.time.getDateTimeString()}] 'Yes We Can' fired`)
        msg.channel.send("Yes We Can", {
            files: [
                "/home/pi/DiscordBot/res/img/yeswecan.png"
            ]
        });
    }
}

// Connect to discord
function login() {
    // Debugging info
    console.log(`Using prefix: ${config.prefix}`);
    console.log(`Using token: ${config.token}`);

    // Login
    this.client.login(config.token);
}

// Function to react when connected
function onConnect() {
    console.log(`[${util.time.getDateTimeString()}] Connected to Discord as ${this.client.user.tag}`);

    // Set status
    this.client.user.setActivity(config.status);

    // Start downloading quotes and cache them
    if (config.downloadQuotes) {
        const channel = this.client.channels.cache.get(config.quotesChannel);
        const fetch = function() {
            channel.messages.fetch({
                limit: 100,
                before: (this.quotes.length == 0 ? undefined : this.quotes[this.quotes.length - 1].id)
            }).then(function(msgs) {
                // Append retrieved messages
                this.quotes = this.quotes.concat(msgs.array());
                console.log(`[${util.time.getDateTimeString()}] Retrieved ${msgs.array().length} messages from #quotes (total: ${this.quotes.length})`);

                // Fetch more if we retrieved some messages, otherwise stop
                if (msgs.array().length == 100) {
                    fetch();
                } else {
                    this.quotes.reverse();
                    console.log(`[${util.time.getDateTimeString()}] Downloaded ${this.quotes.length} quotes in total`);
                }
            }.bind(this));
        }.bind(this);
        fetch();
    }
}

// Function to react to when a message is received
function onReceiveMessage(msg) {
    // Ignore other bot messages
    if (msg.author.bot) {
        return;
    }

    // Iterate over each 'special case' command
    this.specialCmds.forEach(function (cmd) {
        cmd(msg);
    });

    // Ignore messages not starting with the bot's prefix
    if (!msg.content.startsWith(config.prefix)) {
        return;
    }

    // Separate message into command and arguments
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    // Iterate over each registered command and call function if matching
    this.cmds.forEach(function(entry) {
        if (cmd === entry.cmd) {
            console.log(`[${util.time.getDateTimeString()}] Received '${entry.cmd}' command`);
            entry.func(msg, args);
        }
    });
}

// Print all registered commands along with what they do
function printHelp(msg, args) {
    // Heading
    var str = `**${this.client.user.username}'s Commands**`;

    // Iterate and print in form "<prefix><cmd>: <description>"
    this.cmds.forEach(function(entry) {
        if (!entry.hidden) {
            str += `\n\`${config.prefix}${entry.cmd}\` - ${entry.desc}`;
        }
    }.bind(this));

    // Send to discord
    msg.channel.send(str);
}

// From random strings that daniel would say
function randomDaniel(msg, args) {
    // Get number of strings to generate
    if (args.length == 0) {
        var count = 1;
    } else {
        var count = util.input.fitRange(args[0], 0, config.danielLimit);
    }

    // Form message
    var string = "";
    for (var i = 0; i < count; i++) {
        var rand1 = Math.floor(Math.random() * daniel.part1.lines.length);
        var rand2 = Math.floor(Math.random() * daniel.part2.lines.length);
        var rand3 = Math.floor(Math.random() * daniel.part3.lines.length);
        string += `${daniel.part1.lines[rand1]} ${daniel.part2.lines[rand2]}${daniel.part3.lines[rand3]}\n`;
    }

    // Send
    if (string.length > 0) {
        msg.channel.send(string);
    }
}

// Send a number of quotes randomly picked from previously retrieved quotes
function randomQuote(msg, args) {
    // Do nothing if we don't have quotes yet
    if (this.quotes.length == 0) {
        msg.channel.send("Still loading quotes... try again in a bit!");
        return;
    }

    // Get number of quotes to semd
    if (args.length == 0) {
        var count = 1;
    } else {
        var count = util.input.fitRange(args[0], 0, config.danielLimit);
    }

    // Append random quotes
    var string = "";
    for (var i = 0; i < count; i++) {
        // Get random index
        var rand = Math.floor(Math.random() * this.quotes.length);
        while (this.quotes[rand].content.length == 0) {
            rand = Math.floor(Math.random() * this.quotes.length);
        }

        // Format and append to string
        var author = this.quotes[rand].author.username;
        string += `**Quote #${rand} (quoted by ${author}):**\n`
        string += this.quotes[rand].content;
        if (count > 1 && i < count - 1) {
            string += "\n\n";
        }
    }

    // Send
    if (string.length > 0) {
        msg.channel.send(string);
    }
}

// Reply to a message by deleting it and sending the specified image
function replyImage(msg, image, del) {
    // Delete if flag passed
    if (del) {
        msg.delete().catch(e => {});
    }

    // Send image
    msg.channel.send("", {
        files: [
            image
        ]
    });
}

// Constructor instantiates bot but does not attempt to connect to discord
function Bot() {
    this.client = new Discord.Client();

    // Assign member functions
    this.checkImDad = checkImDad;
    this.checkYesWeCan = checkYesWeCan;
    this.login = login;
    this.onConnect = onConnect;
    this.onReceiveMessage = onReceiveMessage;
    this.printHelp = printHelp;
    this.randomDaniel = randomDaniel;
    this.randomQuote = randomQuote;
    this.replyImage = replyImage;

    // Create member variables
    this.quotes = [];

    // Print connection message
    this.client.on("ready", async function() {
        this.onConnect();
    }.bind(this));

    // Assign function to handle receiving messages
    this.client.on("message", async function(msg) {
        this.onReceiveMessage(msg);
    }.bind(this));


    // Register 'special' commands with bot
    this.specialCmds = [
        function (msg) {
            this.checkImDad(msg);
        }.bind(this),
        function(msg) {
            this.checkYesWeCan(msg);
        }.bind(this)
    ];

    // Register normal commands with bot
    this.cmds = [
        {
            cmd: "bonk",
            desc: "Send someone to _that_ jail",
            func: function(msg, args) {
                this.replyImage(msg, "/home/pi/DiscordBot/res/img/bonk.png", true);
            }.bind(this),
            hidden: false
        },
        {
            cmd: "d",
            desc: "",
            func: function(msg, args) {
                this.randomDaniel(msg, args);
            }.bind(this),
            hidden: true
        },
        {
            cmd: "daniel",
            desc: `Become one with Daniel (\`${config.prefix}d\` for short)`,
            func: function(msg, args) {
                this.randomDaniel(msg, args);
            }.bind(this),
            hidden: false
        },
        {
            cmd: "help",
            desc: "Show this list, duh \\:)",
            func: function(msg, args) {
                this.printHelp(msg, args)
            }.bind(this),
            hidden: false
        },
        {
            cmd: "quote",
            desc: "Get some random quotes from #quotes",
            func: function(msg, args) {
                this.randomQuote(msg, args)
            }.bind(this),
            hidden: false
        }
    ];
}
exports.Bot = Bot;