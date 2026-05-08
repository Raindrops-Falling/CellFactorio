// overload console.log so we can print in python server
const oldLog = console.log;

console.log = function (...args) {
    // send log data to python
    fetch('/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
    });

    // still print in browser console
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

        // START GAME BUTTON
        this.createButton(400, 280, "Start Game", () => {
            console.log("The game has been started");

            this.scene.start("GameScene", {
                loaded: false
            });
        });

        // LOAD GAME BUTTON
        this.createButton(400, 360, "Load the Game", () => {
            const saveData = localStorage.getItem("cellGameSave");

            if (saveData) {
                console.log("Loaded saved game");

                this.scene.start("GameScene", {
                    loaded: true,
                    saveData: JSON.parse(saveData)
                });
            } else {
                console.log("No save file found");
            }
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

        btn.on('pointerover', () => {
            btn.setStyle({ backgroundColor: "#333" });
        });

        btn.on('pointerout', () => {
            btn.setStyle({ backgroundColor: "#000" });
        });

        return btn;
    }

    update() {
        uptime++;

        titleText.y = 120 + 10 * Math.sin(uptime / 50);
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    init(data) {
        this.loaded = data?.loaded || false;
        this.saveData = data?.saveData || null;
    }

    create() {
        this.cameras.main.setBackgroundColor("#FFFFFF");

        this.add.text(
            400,
            80,
            this.loaded ? "LOADED GAME" : "NEW GAME",
            {
                fontSize: "40px",
                color: "#000000"
            }
        ).setOrigin(0.5);

        // PLAYER POSITION
        let startX = 400;
        let startY = 400;

        // if loaded save exists
        if (this.saveData) {
            startX = this.saveData.x;
            startY = this.saveData.y;
        }

        // PLAYER
        this.player = this.add.circle(startX, startY, 20, 0x00ff00);

        // KEYBOARD INPUT
        this.cursors = this.input.keyboard.createCursorKeys();

        // SAVE BUTTON
        this.saveBtn = this.add.text(100, 500, "SAVE", {
            fontSize: "30px",
            backgroundColor: "#000",
            color: "#00ff00",
            padding: { x: 10, y: 5 }
        });

        this.saveBtn.setInteractive({ useHandCursor: true });

        this.saveBtn.on("pointerdown", () => {
            localStorage.setItem("cellGameSave", JSON.stringify({
                x: this.player.x,
                y: this.player.y
            }));

            console.log("Game Saved");
        });

        // MENU BUTTON
        this.menuBtn = this.add.text(700, 500, "MENU", {
            fontSize: "30px",
            backgroundColor: "#000",
            color: "#ff0000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.menuBtn.setInteractive({ useHandCursor: true });

        this.menuBtn.on("pointerdown", () => {
            this.scene.start("MenuScene");
        });
    }

    update() {
        const speed = 4;

        if (this.cursors.left.isDown) {
            this.player.x -= speed;
        }

        if (this.cursors.right.isDown) {
            this.player.x += speed;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= speed;
        }

        if (this.cursors.down.isDown) {
            this.player.y += speed;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, GameScene]
};

new Phaser.Game(config);