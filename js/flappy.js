// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)

var score = 0;
//play sound?
var isAnnoying = false;
var width = 790;
var height = 400;
var startingGrav = 200;
var blockHeight = 50;
var pipeSpeed = 100;
var gapSize = 200;
var gapMargin = 50;
var pipeEndHeight = 25;
var pipeEndWidth = 60;
var trailInterval = 0.1;
var jumpInvert = false;
var pipeInterval = 2;
var pipes = [];
var balloons = [];
var weights = [];
var inverts = [];
var pewPickups = [];
var pewProjectiles = [];
var ammoIcons = [];
var scoreBoxes = [];
var pickupsAll = [];
var bombPickups = [];
var explosions = [];
var miniPickups = [];
var trailPickups = [];
var trailParts = [];
var guiLayer = [];
var trailTime = 0;
var ammo = 0;
var bombAmmo = 0;
var currentGrav = startingGrav;
var soundIsPlaying = false;
var bombIcon;
var pauseScreen;
var generateLoop;
var trailLoop;
var scoreText;
var player;
var message;
var style1 = {font: "16px Arial"};
var style2 = {font: "16px Jokerman", fill: "red"};
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', stateActions);
/*
 * Loads all resources for the game and gives them names.
 */
function preload() {
  game.load.image("pewProjectile", "../assets/pewlaser.png");
  game.load.audio("mlg", "../assets/MLG.mp3");
  game.load.image("playerImg", "../assets/flappy-cropped.png");
  game.load.image("endImage", "../assets/pipe-end.png");
  game.load.image("backgroundImage", "../assets/bg1.jpg");
  game.load.audio("scoreSound", "../assets/point.ogg");
  game.load.image("pipe", "../assets/pipe.png");
  game.load.image("balloonImg", "../assets/balloons.png");
  game.load.image("weightImg", "../assets/weight.png");
  game.load.image("invertImg", "../assets/invert.png");
  game.load.image("pewImg", "../assets/pewpewgun.png");
  game.load.image("bombImg", "../assets/bomb.png");
  game.load.image("explosionImg", "../assets/explosion.png");
  game.load.image("backgroundTile", "../assets/pipe_purple.png");
  game.load.image("minimizeImg", "../assets/minimize.png");
  game.load.image("trailPickupImg", "../assets/pipe_yellow.png");
  game.load.audio("minimize", "../assets/smb_pipe.wav");
  game.physics.startSystem(Phaser.Physics.ARCADE);
}

/*
 * Initialises the game. This function is only called once.
 */
function create() {

    game.stage.setBackgroundColor("#DDDDDD");

    player = game.add.sprite(width/2, height/2, "playerImg");
    game.physics.arcade.enable(player);
    player.visible = false;
    var splash1 = game.add.text(width/2 - 300, height/2, "This game is completely pointless, you flap up and down, hit pipes, use powerups.",style1);
    var splash2 = game.add.text(width/2 - 130, height/2 + 30, "Why? Don't ask me, I just made it...",style1);
    var splash3 = game.add.text(width/2 - 240, height/2 + 60, "Enter to start, space to flap, C to shoot, B to bomb - go on, waste your life.",style2);
    game.input
      .keyboard.addKey(Phaser.Keyboard.ENTER)
      .onDown.add(start);

}

function start(){
  var backTile = game.add.tileSprite(0,0,width,height,"backgroundTile");
  backTile.autoScroll(-pipeSpeed/5,0);
  currentGrav = startingGrav;
  jumpInvert = false;
  pipeSpeed = 100;
  pipeInterval = 2;
  gapSize = 200;
  // set the background colour and image of the scene
  game.stage.setBackgroundColor("#99ff99");
  //game.add.image(0,0,"backgroundImage");
  //set up player
  player.visible = true;
  player.bringToTop();
  player.anchor.setTo(0.5,0.5);
  player.body.gravity.y = startingGrav;
  //set up score counter
  scoreText = game.add.text(0,0,"0");
  guiLayer.push(scoreText);
  message = game.add.text(60,20,"You are sad, stop wasting your life playing this useless game.",{font:"20px Times",fill:"#19D2D5"});
  guiLayer.push(message);
  //get spacebar input
  game.input
    .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    .onDown.add(PlayerJump);
  game.input
    .keyboard.addKey(Phaser.Keyboard.ESC)
    .onDown.add(PauseGame);
  game.input
    .keyboard.addKey(Phaser.Keyboard.C)
    .onDown.add(FirePew);
  game.input
    .keyboard.addKey(Phaser.Keyboard.B)
    .onDown.add(Explode);
    //start pipe generation
    pipeInterval = pipeInterval * Phaser.Timer.SECOND;
    generateLoop = game.time.events.loop(pipeInterval,GeneratePipe);
    player.body.gravity.y = startingGrav;
    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.remove(start);
}

/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
  player.bringToTop();
  player.rotation = Math.atan(player.body.velocity.y/200);
  //check for collisions
  game.physics.arcade.overlap(player, pipes, GameOver);
  if (player.y < 0 || player.y > height){
    GameOver();
  }
  if (soundIsPlaying === true){
    soundIsPlaying = false;
  }

  for (var s = explosions.length - 1; s>=0; s--){
    explosions[s].scale.setTo(
      explosions[s].scale.x * 1.1,
      explosions[s].scale.y * 1.1
    );
    if (explosions[s].scale.x > 1){
      explosions[s].destroy();
    }
  }
  for (var x = miniPickups.length; x>=0; x--){
    game.physics.arcade.overlap(player, miniPickups[x], function(){
      player.scale.setTo(
        player.scale.x * 0.75,
        player.scale.y * 0.75
      );
      if(isAnnoying === true)
      {
        game.sound.play("minimize");
        soundIsPlaying = true;
      }
      miniPickups[x].destroy();
    });
  }
  for(var i = balloons.length - 1; i >= 0; i--){
    game.physics.arcade.overlap(player, balloons[i], function(){
      if (currentGrav > 0){
        ChangeGrav(-50);
      }
      else{
        ChangeGrav(50);
      }
      balloons[i].destroy();
      balloons.splice(i, 1);
    });
  }
  for (var c = weights.length - 1; c >= 0; c--){
    game.physics.arcade.overlap(player, weights[c], function(){
      if (currentGrav > 0){
      ChangeGrav(50);
      }
      else{
        ChangeGrav(-50);
      }
      weights[c].destroy();
      weights.splice(c,1);
    });
  }
  for (var a = inverts.length - 1; a >= 0; a--){
    game.physics.arcade.overlap(player, inverts[a], function(){
      inverts[a].destroy();
      currentGrav = currentGrav * -1;
      player.body.gravity.y = currentGrav;
      if (jumpInvert === true){
        jumpInvert = false;
      } else
      jumpInvert = true;
    });
  }
  for (var b = pewPickups.length -1; b>=0; b--){
    game.physics.arcade.overlap(player,pewPickups[b], function(){
      pewPickups[b].destroy();
      AddAmmo(3);
    });
  }
  for (var h = bombPickups.length - 1; h>=0; h--){
    game.physics.arcade.overlap(player, bombPickups[h], function(){
      bombPickups[h].destroy();
      if (bombAmmo === 0){
        bombAmmo++;
        bombIcon = game.add.sprite(width -200,height - 50, "bombImg");
        bombIcon.scale.setTo(0.05,0.05);
      }
    });
  }
  for (var z = trailPickups.length - 1; z>=0; z--){
    game.physics.arcade.overlap(player, trailPickups[z], function(){
      trailPickups[z].destroy();
      trailTime +=5;
      trailLoop = game.time.events.loop(trailInterval * Phaser.Timer.SECOND, GenerateTrail);
    });
  }
  for (var d = pewProjectiles.length - 1; d>=0;d--){
    for (var e = pipes.length - 1; e>=0; e--){
      game.physics.arcade.overlap(pewProjectiles[d],pipes[e], function(){
        for (var y = pipes.length - 1; y>=0; y--){
          game.physics.arcade.overlap(pipes[e], pipes[y], function(){
            pipes[y].destroy();
          });
        }
        pipes[e].destroy();
        pewProjectiles[d].destroy();
      });
    }
  }
  for (var w = scoreBoxes.length - 1; w >= 0; w--){
    game.physics.arcade.overlap(scoreBoxes[w], player, function(){
      score++;
      scoreText.setText(score.toString());
      scoreBoxes[w].destroy();
      if (isAnnoying === true && soundIsPlaying === false){
        game.sound.play("scoreSound");
      }
      if (score % 5 === 0)
      {
        pipeSpeed +=50;
        gapSize -= 30;
        pipeInterval *= 0.75;
        for (var r = pipes.length - 1; r >= 0; r--){
          pipes[r].body.velocity.x = -pipeSpeed;
        }
        for (var u = pickupsAll.length - 1; u >= 0; u--){
          pickupsAll[u].body.velocity.x = -pipeSpeed;
        }
        GeneratePipe();
        game.time.events.remove(generateLoop);
        generateLoop = game.time.events.loop(pipeInterval,GeneratePipe);
      }
    });
  }
  for (var g = pipes.length -1; g>=0; g--){
    if (pipes[g].x < -blockHeight){
      pipes[g].destroy();
    }
  }
  for (var o = pickupsAll.length -1; g>=0; g--){
    if (pickupsAll[g].x < -blockHeight){
      pickupsAll[g].destroy();
    }
  }
  for (var r = trailParts.length - 1; r>=0; r--){
    if (trailParts[r].x < -blockHeight){
      trailParts[r].destroy();
    }
  }
}

function GenerateTrail(){
  var trailPart = game.add.sprite(player.x, player.y, "trailPickupImg");
  trailPart.rotation = player.rotation;
  game.physics.enable(trailPart);
  trailPart.body.velocity.x = -pipeSpeed;
  trailParts.push(trailPart);
  guiLayer.push(trailPart);
  trailTime -= trailInterval;
  if (trailTime < 0){
    trailTime = 0;
    game.time.events.remove(trailLoop);
  }
}

function AddAmmo(x){
  for (var v = 1; v<=x; v++){
    var newIcon = game.add.sprite(width - 400/5, height - 110/5 - 110/5 * ammo, "pewProjectile");
    newIcon.scale.setTo(0.2,0.2);
    ammo++;
    ammoIcons.push(newIcon);
    guiLayer.push(newIcon);
  }
}

function RemoveAmmo(){
    ammoIcons[ammoIcons.length -1].destroy();
    ammoIcons.splice(ammoIcons.length-1,1);
    ammo -- ;
}

function Explode(){
  if (bombAmmo == 1){
    bombIcon.destroy();
    bombAmmo--;
    var explosion = game.add.sprite(player.x,player.y,"explosionImg");
    explosions.push(explosion);
    guiLayer.push(explosion);
    explosion.scale.setTo(0.01,0.01);
    explosion.anchor.setTo(0.5,0.5);
    for (var i = pipes.length - 1; i>=0; i--){
      var dx = player.x - pipes[i].x;
      var dy = player.y - pipes[i].y;
      var dist = Math.sqrt(dy*dy + dx*dx);
      if (dist < 200){
        pipes[i].destroy();
      }
    }
  }
}

function FirePew(){
  if (ammo > 0){
    RemoveAmmo();
    var pew = game.add.sprite(player.x,player.y,"pewProjectile");
    pew.scale.setTo(0.15,0.15);
    game.physics.arcade.enable(pew);
    pew.body.velocity.x = pipeSpeed;
    pewProjectiles.push(pew);
  }
}

function ChangeGrav(g)
{
  currentGrav += g;
  player.body.gravity.y = currentGrav;
}

function SetGravity(g){
  startingGrav = g;
  currentGrav = g;
  player.body.gravity.y = currentGrav;
}

//ends the game by reloading the page
function GameOver(){
  registerScore(score);
  //alert("Your score was: " + score);
  score = 0;
  ammo = 0;
  for (var i = ammoIcons.length-1; i>=0; i--){
    ammoIcons[i].destroy();
  }
  game.state.restart();
  game.paused = false;
}


function AddPipeBlock(x,y)
{
  var block = game.add.sprite(x,y,"pipe");
  game.physics.arcade.enable(block);
  block.body.velocity.x = -pipeSpeed;
  pipes.push(block);
}

function PauseGame(){
  if (game.paused === true){
    pauseScreen.destroy();
    game.paused = false;
  }
  else{
    pauseScreen = game.add.text(width/2-260,height/2, "Game is paused, hit ESC again to resume");
    game.paused = true;
  }
}

function AddPickup(y)
{
  var rngesus = game.rnd.integerInRange(0,10);
  if (rngesus === 0)
  {
    var balloon = game.add.sprite(width, y, "balloonImg");
    game.physics.arcade.enable(balloon);
    balloon.body.velocity.x = -pipeSpeed;
    balloons.push(balloon);
    pickupsAll.push(balloon);
  }
  if(rngesus === 1)
  {
    var weight =  game.add.sprite(width, y, "weightImg");
    game.physics.arcade.enable(weight);
    weight.body.velocity.x = -pipeSpeed;
    weights.push(weight);
    pickupsAll.push(weight);
  }
  if (rngesus === 2)
  {
    var invert = game.add.sprite(width, y, "invertImg");
    invert.scale.setTo(0.1,0.1);
    game.physics.arcade.enable(invert);
    invert.body.velocity.x = -pipeSpeed;
    inverts.push(invert);
    pickupsAll.push(invert);
  }
  if (rngesus === 3){
    var pew = game.add.sprite(width, y, "pewImg");
    pew.scale.setTo(0.06,0.06);
    game.physics.arcade.enable(pew);
    pew.body.velocity.x = -pipeSpeed;
    pewPickups.push(pew);
    pickupsAll.push(pew);
  }
  if(rngesus === 4){
    var bomb = game.add.sprite(width, y, "bombImg");
    bomb.scale.setTo(0.1,0.1);
    game.physics.arcade.enable(bomb);
    bomb.body.velocity.x = -pipeSpeed;
    bombPickups.push(bomb);
    pickupsAll.push(bomb);
  }
  if(rngesus === 5){
    var mini = game.add.sprite(width, y, "minimizeImg");
    mini.scale.setTo(0.3,0.3);
    game.physics.arcade.enable(mini);
    mini.body.velocity.x = -pipeSpeed;
    miniPickups.push(mini);
    pickupsAll.push(mini);
  }
  if (rngesus === 6){
    var trailPickup = game.add.sprite(width, y, "trailPickupImg");
    game.physics.arcade.enable(trailPickup);
    trailPickup.body.velocity.x = -pipeSpeed;
    trailPickups.push(trailPickup);
    pickupsAll.push(trailPickup);
  }
}

function AddPipeEnd(y)
{
  var end = game.add.sprite(width - (pipeEndWidth - blockHeight)/2, y + blockHeight/2, "endImage");
  game.physics.arcade.enable(end);
  end.body.velocity.x = -pipeSpeed;
  pipes.push(end);
}

function ToggleSound(){
  if (isAnnoying === true){
    isAnnoying = false;
  }
  else{
    isAnnoying = true;
  }
}

function GeneratePipe()
{
  //score = addOne(score);
  var gapStart = game.rnd.integerInRange(gapMargin, height - gapMargin - gapSize);
  var blockY = gapStart;
  while (blockY > -gapMargin)
  {
    AddPipeBlock(width,blockY);
    blockY -= blockHeight;
  }
  AddPipeEnd(gapStart);
  blockY = gapStart + gapSize + blockHeight;
  while (blockY < height + gapMargin)
  {
    AddPipeBlock(width,blockY);
    blockY += blockHeight;
  }
  AddPipeEnd(gapStart + gapSize + pipeEndHeight);
  AddPickup(gapStart + gapSize/2 + blockHeight/2);
  var scoreBox = game.add.sprite(width,height/2,"pewProjectile");
  scoreBox.scale.setTo(1,20);
  game.physics.enable(scoreBox);
  scoreBox.body.velocity.x = -pipeSpeed;
  scoreBoxes.push(scoreBox);
}

function PlayerJump(){
  if (jumpInvert === true){
    player.body.velocity.y = (startingGrav - startingGrav/4);
  }
  else{
    player.body.velocity.y = -(startingGrav - startingGrav/4);
  }
}
