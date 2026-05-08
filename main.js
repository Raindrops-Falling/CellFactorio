// overload console.log so we can print in python server
const oldLog = console.log;
console.log = function(...args) {
    // send log data to python
    fetch('/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
    });
    // but still send it to the console log
    oldLog.apply(console, args);
};

let titleText = null;
let uptime = 0;
class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }
    create() {
        this.cameras.main.setBackgroundColor("#0000FF");
        titleText = this.add.text(400, 120, "CELL GAME", {
            fontSize: "80px",
            color: "#FFFF00"
        }).setOrigin(0.5);
        this.createButton(400, 280, "Start Game", () => {
            console.log("The game has been started");
        });
        this.createButton(400, 360, "Load the Game", () => {
            console.log("This game has been saved");
        });
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontSize: "40px",
            backgroundColor: "#000",
            color: "#FFFF00",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', callback);
        btn.on('pointerover', () => btn.setStyle({ backgroundColor: "#333" }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: "#000" }));

        return btn;
    }

    update() {
        uptime++;
        titleText.y = 120 + 10 * Math.sin(uptime / 50);
    }
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene]
};
new Phaser.Game(config);
