let game;

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: '#87CEEB',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1200,
            height: 500,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: PlayGame
    }

    game = new Phaser.Game(gameConfig)
    window.focus();
}

class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.score = 0; // score from collecting assets and destroying enemies
        this.enemy1HitCount = 0; // number of times enemy1 is hit
        this.enemy2HitCount = 0; // number of times enemy2 is hit
        this.playerHitCount = 0;    // number of times player is hit
        this.active = this.enemy1;  // to identify which enemy is destroyed
    }


    preload() {
        this.load.spritesheet('player', 'assets/playerShip.png' , {frameWidth: 68, 70: 100});
        this.load.spritesheet('enemy', 'assets/enemyShip.png', {frameWidth: 63, 70: 100});
        this.load.image("star", "assets/star.png")
        this.load.image("fire", "assets/fire.png")
        this.load.image("coin", "assets/coin.png")
        this.load.image('blast', 'assets/blast.png')
        this.load.image('shield', 'assets/shield.png')
        this.load.image('heart', 'assets/heart.png')
        this.load.image('crash', 'assets/crash.png')
        this.load.image('shieldBig', 'assets/shieldBig.png')
    }

    create() {
    this.player = this.physics.add.sprite(100, 250, 'player');
    this.player.setFrame(3);
    this.enemy1 = this.physics.add.sprite(1000, Phaser.Math.Between(50, game.config.height/2), 'enemy');
    this.enemy1.setFrame(0);
    this.enemy2 = this.physics.add.sprite(1000, Phaser.Math.Between(game.config.height/2 + 10, game.config.height-50), 'enemy');
    this.enemy2.setFrame(0);

    this.cursors = this.input.keyboard.createCursorKeys()
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("player", {start: 6, end:9}),
        frameRate: 10,
    })
    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("player", {start: 0, end: 2}),
        frameRate: 10,
    })
    this.anims.create({
        key: "up",
        frames: this.anims.generateFrameNumbers("player", {start: 9, end: 0}),
        frameRate: 10,
    })
    this.anims.create({
        key: "down",
        frames: this.anims.generateFrameNumbers("player", {start: 3, end: 6}),
        frameRate: 10,
    })
    this.anims.create({
        key: "still",
        frames: [{key: "player", frame: 3}],
        frameRate: 10,
    })
    this.anims.create({
        key: "fire",
        frames: [{key: "fire", frame: 0}],
        frameRate: 10,
    })
    this.anims.create({
        key: "explosion",
        frames: this.anims.generateFrameNumbers("enemy", {start: 1, end: 3}),
        frameRate: 20,
    })

    this.playerFireGroup = this.physics.add.group({}) // so the shield won't block the player's fire
    this.enemyFireGroup = this.physics.add.group({}) // so the shield blocks the enemy's fire only
    this.coinGroup = this.physics.add.group({})
    this.starGroup = this.physics.add.group({})
    this.heartGroup = this.physics.add.group({})
    this.shieldGroup = this.physics.add.group({})

    this.physics.add.overlap(this.player, this.starGroup, this.collectStar, null, this)
    this.physics.add.overlap(this.player, this.coinGroup, this.collectCoin, null, this)
    this.physics.add.overlap(this.player, this.heartGroup, this.collectHeart, null, this)
    this.physics.add.overlap(this.player, this.shieldGroup, this.collectShield, null, this)
    this.physics.add.overlap(this.player, this.enemyFireGroup, this.playerHit, null, this)
    this.physics.add.overlap(this.enemy1, this.playerFireGroup, this.enemyHit, null, this)
    this.physics.add.overlap(this.enemy2, this.playerFireGroup, this.enemyHit, null, this)

    this.scoreText = this.add.text(16, 3, "Total score: " + this.score, {fontSize: "15px", fill: "#000"})
    this.add.image(200, 10, "star")
    this.starText = this.add.text(220, 3, "0", {fontSize: "15px", fill: "#000"})
    this.add.image(300, 10, "coin")
    this.coinText = this.add.text(320, 3, "0", {fontSize: "15px", fill: "#000"})
    this.add.image(400, 10, "heart")
    this.heartText = this.add.text(420, 3, "0", {fontSize: "15px", fill: "#000"})
    this.add.image(500, 10, "shield")
    this.shieldText = this.add.text(520, 3, "0", {fontSize: "15px", fill: "#000"})
    this.add.image(600, 10, "crash")
    this.crashText = this.add.text(620, 3, "0", {fontSize: "15px", fill: "#000"})
    this.playerHitText = this.add.text(720, 3, "Player hit count: " + this.playerHitCount + "/1000"
        , {fontSize: "15px", fill: "#000"})

    
    
    this.fastLoop = this.time.addEvent({ // add assets every 2 seconds
        callback: this.addStarCoin,
        callbackScope: this,
        delay: 2000,
        loop: true
    })

    this.slowLoop = this.time.addEvent({ // add assets every 20 seconds
        callback: this.addHeartShield,
        callbackScope: this,
        delay: 20000,
        loop: true
    })

    this.fireTimer = this.time.addEvent({
        callback: this.enemyFire,
        callbackScope: this,
        delay: 300,
        loop: true
    })

}
    addStarCoin() {
            this.starGroup.create(1000, Phaser.Math.Between(50, game.config.height-50), "star")
            this.starGroup.setVelocityX(-300)
            this.coinGroup.create(1900, Phaser.Math.Between(50, game.config.height-50), "coin")
            this.coinGroup.setVelocityX(-200)
    }

    addHeartShield() {
        this.heartGroup.create(2500, Phaser.Math.Between(50, game.config.height-50), "heart")
        this.heartGroup.setVelocityX(-200)
        this.shieldGroup.create(2500, Phaser.Math.Between(50, game.config.height-50), "shield")
        this.shieldGroup.setVelocityX(-200)

    }

    collectStar(player, star) {
        star.disableBody(true, true)
        this.score += 3
        this.scoreText.setText("Total score: " + this.score)
        this.starText.setText(parseInt(this.starText.text) + 1)
    }

    collectCoin(player, coin) {
        coin.disableBody(true, true)
        this.score += 1
        this.scoreText.setText("Total score: " + this.score)
        this.coinText.setText(parseInt(this.coinText.text) + 1)
    }

    collectHeart(player, heart) {
        heart.disableBody(true, true)
        this.heartText.setText(parseInt(this.heartText.text) + 1)

        if (this.playerHitCount >= 50) 
            this.playerHitCount -= 50
        else
            this.playerHitCount = 0
    }

    collectShield(player, shield) { // creates shield for 7 seconds

        shield.disableBody(true, true) // remove small shield asset from screen
        this.shieldText.setText(parseInt(this.shieldText.text) + 1)

        this.shield1 = this.physics.add.sprite(this.player.x + 100, this.enemy1.y, 'shieldBig')
        this.shield2 = this.physics.add.sprite(this.player.x + 100, this.enemy2.y, 'shieldBig')
        this.physics.add.overlap(this.shield1, this.enemyFireGroup, this.shieldBlock, null, this)
        this.physics.add.overlap(this.shield2, this.enemyFireGroup, this.shieldBlock, null, this)

        this.shieldTimer = this.time.addEvent({
            callback: () => { this.shield1.destroy(); this.shield2.destroy() },
            callbackScope: this,
            delay: 7000,
            loop: false
        })
    }

    shieldBlock(shield, fire) {
        fire.disableBody(true, true)
    }
    
    playerFire() { // makes player fire every time space is pressed

        let fire = this.playerFireGroup.create(this.player.x+30, this.player.y, "fire")
        fire.setVelocityX(1000)
    }

    enemyFire() { // makes enemy fire every 0.3 seconds

        let fire1 = this.enemyFireGroup.create(this.enemy1.x-50, this.enemy1.y, "fire")
        fire1.setFlipX(true) // flip the fire to face the player
        fire1.setVelocityX(-1000)
        let fire2 = this.enemyFireGroup.create(this.enemy2.x-50, this.enemy2.y, "fire")
        fire2.setFlipX(true)
        fire2.setVelocityX(-1000)

        if (this.playerHitCount == 1000) { // stop firing when player is hit 1000 times
            this.fireTimer.destroy()
        }
    }

    playerHit(player, fire) { // when player is hit, increases player hit count

        fire.disableBody(true, true)
        this.playerHitCount += 1
        this.playerHitText.setText("Player hit count: " + this.playerHitCount + "/1000")
    }

    enemyHit(enemy, fire) { // when enemy is hit, increases enemy hit count

        this.active = enemy
        fire.disableBody(true, true)
        if (enemy == this.enemy1) {
            this.enemy1HitCount += 1
        }
        else {
            this.enemy2HitCount += 1
        }
    }

    newEnemy() { // creates new enemy in random location, if one is destroyed

        this.active.disableBody(true, true)

        if (this.active == this.enemy1) {
            this.enemy1HitCount = 0
            this.active  = this.enemy1
            this.enemy1 = this.physics.add.sprite(1000, Phaser.Math.Between(50, game.config.height/2), 'enemy');
            this.physics.add.overlap(this.enemy1, this.playerFireGroup, this.enemyHit, null, this)
            let fire = this.enemyFireGroup.create(this.enemy1.x, this.enemy1.y, "fire")
            fire.setVelocityX(-1000)
        }
        else {
            this.enemy2HitCount = 0
            this.active = this.enemy2
            this.enemy2 = this.physics.add.sprite(1000, Phaser.Math.Between(game.config.height/2 + 10, game.config.height-50), 'enemy');
            this.physics.add.overlap(this.enemy2, this.playerFireGroup, this.enemyHit, null, this)
            let fire = this.enemyFireGroup.create(this.enemy2.x, this.enemy2.y, "fire")
            fire.setVelocityX(-1000)
        }
    }

    update() {
        if(this.cursors.space.isDown) { // fire when space is pressed
            this.playerFire()
        }
        if(this.cursors.left.isDown) {
            this.player.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.player.anims.play("right", true)
        }
        else if(this.cursors.up.isDown) {
            this.player.body.velocity.y = -200
            this.player.anims.play("up", true)
        }
        else if(this.cursors.down.isDown) {
            this.player.body.velocity.y = 200
            this.player.anims.play("down", true)
        }
        else {
            this.player.body.velocity.y = 0
            this.player.anims.play("still", true)
        }
    
        if(this.player.y < 50) {
            this.player.y = 50
        }
    
        if(this.player.y > game.config.height - 50) {
            this.player.y = game.config.height - 50
        }

        if (this.enemy1HitCount == 200 || this.enemy2HitCount == 200) {
            this.active.anims.play("explosion", true)
            this.score += 30
            this.scoreText.setText("Total score: " + this.score)
            this.crashText.setText(parseInt(this.crashText.text) + 1) 

            this.killTimer = this.time.addEvent({
                callback: this.newEnemy,
                callbackScope: this,
                delay: 2000,
                loop: false
            })
        }

        if (this.playerHitCount == 1000) {
            this.player.disableBody(true, true)
            this.add.image(this.player.x, this.player.y, 'blast')
            this.gameOverText = this.add.text(400, 250, 'Game Over', {fontSize: '64px', fill: '#000'})
            this.reloadText = this.add.text(400, 300, 'Reload to begin', {fontSize: '32px', fill: '#000'})
        }
    }
}