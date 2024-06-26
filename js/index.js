var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;


var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/image/bghalowen.jpeg');
    this.load.image('ground', 'assets/image/ground-tanah.png');
    this.load.image('ground-1', 'assets/image/ground-tanah(1).png');
    this.load.image('peti', 'assets/image/peti.png');
    this.load.image('box', 'assets/image/box.png');
    this.load.image('bomb', 'assets/image/bomb.png');
    this.load.image('gameover','assets/image/gameover.png');
    this.load.spritesheet('dude', 'assets/image/org.png', { frameWidth: 26, frameHeight: 48 });
    this.load.audio('bgm', 'assets/audio/bgm.mp3');
    this.load.audio('step', 'assets/audio/step.mp3');
    this.load.audio('poin', 'assets/audio/poin.mp3');
    this.load.audio('die', 'assets/audio/die.mp3');
    this.load.audio('jump', 'assets/audio/jump.mp3');

}

function create ()
{
    this.sound.play('bgm', {loop:true});

    this.step = this.sound.add('step');
    this.poin = this.sound.add('poin');
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(500, 250, 'ground');
    platforms.create(10, 300, 'ground');
    platforms.create(750, 100, 'ground');
    platforms.create(300, 400, 'ground');
    platforms.create(700, 500, 'ground-1');
    platforms.create(680, 460, 'box');
    platforms.create(150, 150, 'box');
    platforms.create(600, 216, 'box');

    // The player and its settings
    player = this.physics.add.sprite(120, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'peti',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ffff00' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
        if (!this.step.isPlaying)
        {
            this.step.play();
        }
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true); 
        if (!this.step.isPlaying)
        {
            this.step.play();
        }
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        this.sound.play('jump');
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);
    this.sound.play('poin');

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    this.sound.play('die');

    gameOver = true;
    var gameOverImage = this.add.image(400, 300, 'gameover');
    gameOverImage.setScale(1);
}