// overload console.log so we can print in python server
const oldLog = console.log;

console.log = function (...args) {
    fetch('/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
    }).catch(err => {
        oldLog("Failed to send log:", err);
    });

    oldLog.apply(console, args);
};

class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        this.uptime = 0;

        this.cameras.main.setBackgroundColor("#07192f");
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.panel = this.add.rectangle(centerX, centerY, this.scale.width - 80, this.scale.height - 160, 0x081f42, 0.92).setStrokeStyle(2, 0x58e0ff);
        //this.titlePanel = this.add.rectangle(centerX, centerY - 210, 560, 140, 0x123b66, 0.75).setStrokeStyle(1, 0xffffff, 0.4);

        this.titleText = this.add.text(centerX, centerY - 220, "CELL FACTORIO", {
            fontSize: "72px",
            color: "#a6f6ff",
            fontStyle: "bold",
            stroke: "#0c2744",
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 4, fill: true }
        }).setOrigin(0.5);

        this.titleBaseY = centerY - 220;
        this.subtitleText = this.add.text(
            centerX,
            centerY - 160,
            "Move the cell with your mouse and save your progress.",
            {
                fontSize: "22px",
                color: "#d0ebff",
                align: "center",
                wordWrap: { width: 560 }
            }
        ).setOrigin(0.5);

        this.glowPulse = this.add.circle(centerX, centerY - 210, 110, 0x55d6ff, 0.12);
        this.tweens.add({
            targets: this.glowPulse,
            scale: 1.08,
            alpha: 0.18,
            duration: 1800,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });

        this.createFloatingOrb(120, 220, 0x6cebff, 8, 0);
        this.createFloatingOrb(700, 260, 0xffc86e, 10, 300);
        this.createFloatingOrb(240, 400, 0x8de9a3, 8, 600);
        this.createFloatingOrb(560, 360, 0xff8cc5, 10, 900);

        // START GAME BUTTON
        this.startBtn = this.createButton(centerX, centerY - 20, "Start Game", () => {
            console.log("The game has been started");

            this.scene.start("GameScene", {
                loaded: false
            });
        });

        // LOAD GAME BUTTON
        this.loadBtn = this.createButton(centerX, centerY + 60, "Load the Game", () => {
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

        this.scale.on('resize', this.updateLayout, this);
    }

    updateLayout(gameSize) {
        const width = gameSize?.width || this.scale.width;
        const height = gameSize?.height || this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        if (this.panel) {
            this.panel.setPosition(centerX, centerY).setSize(width - 80, height - 160);
        }
        if (this.titlePanel) {
            this.titlePanel.setPosition(centerX, centerY - 210);
        }
        if (this.titleText) {
            this.titleText.setPosition(centerX, this.titleBaseY);
        }
        if (this.subtitleText) {
            this.subtitleText.setPosition(centerX, centerY - 160);
        }
        if (this.glowPulse) {
            this.glowPulse.setPosition(centerX, centerY - 210);
        }
        if (this.startBtn) {
            this.startBtn.setPosition(centerX, centerY - 20);
        }
        if (this.loadBtn) {
            this.loadBtn.setPosition(centerX, centerY + 60);
        }
    }

    createFloatingOrb(x, y, color, radius, delay) {
        const orb = this.add.circle(x, y, radius, color, 0.18);
        this.tweens.add({
            targets: orb,
            x: x + Phaser.Math.Between(-24, 24),
            y: y + Phaser.Math.Between(-30, 30),
            duration: 3000 + Phaser.Math.Between(0, 1200),
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
            delay
        });
        return orb;
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontSize: "40px",
            backgroundColor: "#194e8f",
            color: "#ffffff",
            padding: { x: 24, y: 14 },
            stroke: "#45d6ff",
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 4, fill: true }
        }).setOrigin(0.5);

        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.tweens.add({
                targets: btn,
                scale: 0.95,
                duration: 80,
                yoyo: true
            });
            callback();
        });

        btn.on('pointerover', () => {
            btn.setStyle({ backgroundColor: "#3377c1", color: "#f8ffea" });
            btn.setScale(1.08);
        });

        btn.on('pointerout', () => {
            btn.setStyle({ backgroundColor: "#194e8f", color: "#ffffff" });
            btn.setScale(1);
        });

        return btn;
    }

    update() {
        this.uptime++;

        this.titleText.y = 120 + 10 * Math.sin(this.uptime / 50);
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
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.gameTitle = this.add.text(
            centerX,
            80,
            this.loaded ? "LOADED GAME" : "NEW GAME",
            {
                fontSize: "40px",
                color: "#000000"
            }
        ).setOrigin(0.5);

        // PLAYER POSITION
        let startX = centerX;
        let startY = centerY;

        // LOAD SAVE DATA
        if (this.saveData) {
            startX = this.saveData.x;
            startY = this.saveData.y;
        }

        // PLAYER
        this.player = this.add.circle(startX, startY, 20, 0x00ff00);

        // TARGET POSITION
        this.targetX = startX;
        this.targetY = startY;

        // MOUSE MOVEMENT
        this.input.on("pointermove", (pointer) => {
            const margin = 40;
            const minX = margin;
            const maxX = this.scale.width - margin;
            const minY = margin;
            const maxY = this.scale.height - margin;

            this.targetX = Phaser.Math.Clamp(pointer.x, minX+100, maxX-100);
            this.targetY = Phaser.Math.Clamp(pointer.y, minY+100, maxY-100);
        });

        // SAVE BUTTON
        this.saveBtn = this.add.text(100, this.scale.height - 50, "SAVE", {
            fontSize: "30px",
            backgroundColor: "#000",
            color: "#00ff00",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.saveBtn.setInteractive({ useHandCursor: true });

        // SAVE MESSAGE
        this.savedText = this.add.text(centerX, this.scale.height - 50, "", {
            fontSize: "24px",
            color: "#008800"
        }).setOrigin(0.5);

        this.saveBtn.on("pointerdown", () => {
            localStorage.setItem("cellGameSave", JSON.stringify({
                x: this.player.x,
                y: this.player.y
            }));

            console.log("Game Saved");

            this.savedText.setText("GAME SAVED");

            this.time.delayedCall(1500, () => {
                this.savedText.setText("");
            });
        });

        // MENU BUTTON
        this.menuBtn = this.add.text(this.scale.width - 100, this.scale.height - 50, "MENU", {
            fontSize: "30px",
            backgroundColor: "#000",
            color: "#ff0000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.menuBtn.setInteractive({ useHandCursor: true });

        this.menuBtn.on("pointerdown", () => {
            this.scene.start("MenuScene");
        });

        // PLAYER LABEL
        this.playerLabel = this.add.text(
            this.player.x,
            this.player.y - 40,
            "PLAYER",
            {
                fontSize: "20px",
                color: "#000000"
            }
        ).setOrigin(0.5);

        this.scale.on('resize', this.updateLayout, this);
    }

    updateLayout(gameSize) {
        const width = gameSize?.width || this.scale.width;
        const height = gameSize?.height || this.scale.height;
        const centerX = width / 2;

        if (this.gameTitle) {
            this.gameTitle.setPosition(centerX, 80);
        }
        if (this.saveBtn) {
            this.saveBtn.setPosition(100, height - 50);
        }
        if (this.menuBtn) {
            this.menuBtn.setPosition(width - 100, height - 50);
        }
        if (this.savedText) {
            this.savedText.setPosition(centerX, height - 50);
        }
    }

    update() {
        // SMOOTH MOVEMENT
        this.player.x = Phaser.Math.Linear(
            this.player.x,
            this.targetX,
            0.08
        );

        this.player.y = Phaser.Math.Linear(
            this.player.y,
            this.targetY,
            0.08
        );

        // KEEP PLAYER INSIDE SCREEN
        const margin = 20;
        const maxX = this.scale.width - margin;
        const maxY = this.scale.height - margin;

        this.player.x = Phaser.Math.Clamp(this.player.x, margin, maxX);
        this.player.y = Phaser.Math.Clamp(this.player.y, margin, maxY);

        // UPDATE LABEL POSITION
        this.playerLabel.x = this.player.x;
        this.playerLabel.y = this.player.y - 40;
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    backgroundColor: "#000000",
    scene: [MenuScene, GameScene]
};

new Phaser.Game(config);
