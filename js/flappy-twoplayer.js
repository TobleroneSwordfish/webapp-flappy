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
var currentGrav = startingGrav;
var blockHeight = 50;
var pipeSpeed = 100;
var gapSize = 200;
var gapMargin = 50;
var pipeEndHeight = 25;
var pipeEndWidth = 60;
var scoreText;
var player1;
var player2;
var players = [];
var jumpInvert = false;
var pipes = [];
var balloons = [];
var weights = [];
var inverts = [];
var pewPickups = [];
var pewProjectiles = [];
var ammoIcons = [];
var scoreBoxes = [];
var pickupsAll = [];
var ammo = 0;
var pipeInterval = 2;
var pauseScreen;
var generateLoop;
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
  game.physics.startSystem(Phaser.Physics.ARCADE);
}

/*
 * Initialises the game. This function is only called once.
 */
function create() {

    game.stage.setBackgroundColor("#DDDDDD");

    player1 = game.add.sprite(width/2 + 30, height/2, "playerImg");
    player2 = game.add.sprite(width/2 - 30, height/2, "playerImg");
    game.physics.arcade.enable(player2);
    game.physics.arcade.enable(player1);
    player1.visible = false;
    player2.visible = false;
    var splash1 = game.add.text(width/2 - 300, height/2, "This game is completely pointless, you flap up and down, hit pipes, use powerups.",style1);
    var splash2 = game.add.text(width/2 - 130, height/2 + 30, "Why? Don't ask me, I just made it...",style1);
    var splash3 = game.add.text(width/2 - 200, height/2 + 60, "Enter to start, space to flap, C to shoot - go on, waste your life.",style2);
    game.input
      .keyboard.addKey(Phaser.Keyboard.ENTER)
      .onDown.add(start);
}

function start(){
  currentGrav = startingGrav;
  jumpInvert = false;
  pipeSpeed = 100;
  pipeInterval = 2;
  // set the background colour and image of the scene
  game.stage.setBackgroundColor("#99ff99");
  game.add.image(0,0,"backgroundImage");
  //set up player1
  player1.visible = true;
  player1.bringToTop();
  player1.anchor.setTo(0.5,0.5);
  player1.body.gravity.y = startingGrav;
  players.push(player1);
  //set up player2
  player2.visible = true;
  player2.bringToTop();
  player2.anchor.setTo(0.5,0.5);
  player2.body.gravity.y = startingGrav;
  players.push(player2);
  //set up score counter
  scoreText = game.add.text(0,0,"0");
  game.add.text(60,20,"You are sad, stop wasting your life playing this useless game.",{font:"20px Times",fill:"#19D2D5"});
  //get spacebar input
  game.input
    .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    .onDown.add(Player1Jump);
  game.input
    .keyboard.addKey(Phaser.Keyboard.M)
    .onDown.add(Player2Jump);
  game.input
    .keyboard.addKey(Phaser.Keyboard.ESC)
    .onDown.add(PauseGame);
  game.input
    .keyboard.addKey(Phaser.Keyboard.C)
    .onDown.add(FirePew1);
    //start pipe generation
    pipeInterval = pipeInterval * Phaser.Timer.SECOND;
    generateLoop = game.time.events.loop(pipeInterval,GeneratePipe);
    player1.body.gravity.y = startingGrav;
    player2.body.gravity.y = startingGrav;
    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.remove(start);
}

/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
  player1.rotation = Math.atan(player1.body.velocity.y/200);
  player2.rotation = Math.atan(player2.body.velocity.y/200);
  //check for collisions
  for (var p = players.length-1; p>=0; p--){
    game.physics.arcade.overlap(players[p], pipes, GameOver);
  }

  if ((player1.y < 0 || player1.y > height) || (player2.y < 0 || player2.y > height)){
    GameOver();
  }
  for (var k = players.length-1; k>=0; k--){
    for(var i = balloons.length - 1; i >= 0; i--){
      game.physics.arcade.overlap(players[k], balloons[i], function(){
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
  }
  for(var t = players.length-1; t>=0; t--){
    for (var c = weights.length - 1; c >= 0; c--){
      game.physics.arcade.overlap(players[t], weights[c], function(){
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
  }
  for(var z = players.length-1; z>=0; z--){
  for (var a = inverts.length - 1; a >= 0; a--){
    game.physics.arcade.overlap(players[z], inverts[a], function(){
      inverts[a].destroy();
      currentGrav = currentGrav * -1;
      player1.body.gravity.y = currentGrav;
      player2.body.gravity.y = currentGrav;
      if (jumpInvert === true){
        jumpInvert = false;
      } else
      jumpInvert = true;
    });
  }
}
for(var l = players.length; l>=0; l--){
  for (var b = pewPickups.length -1; b>=0; b--){
    game.physics.arcade.overlap(players[l], pewPickups[b], function(){
      pewPickups[b].destroy();
      AddAmmo(3);
    });
  }
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
  for(var q = players.length; q>=0; q--){
  for (var w = scoreBoxes.length - 1; w >= 0; w--){
    game.physics.arcade.overlap(scoreBoxes[w], players[q], function(){
      score++;
      scoreText.setText(score.toString());
      scoreBoxes[w].destroy();
      if (score % 5 == 0)
      {
        pipeSpeed +=50;
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
}
}

function AddAmmo(x){
  for (var v = 1; v<=x; v++){
    var newIcon = game.add.sprite(width - 400/5, height - 110/5 - 110/5 * ammo, "pewProjectile");
    newIcon.scale.setTo(0.2,0.2);
    ammo++;
    ammoIcons.push(newIcon);
  }
}

function RemoveAmmo(){
    ammoIcons[ammoIcons.length -1].destroy();
    ammoIcons.splice(ammoIcons.length-1,1);
    ammo -- ;
}

function FirePew1(){
  if (ammo > 0){
    RemoveAmmo();
    var pew = game.add.sprite(player1.x,player1.y,"pewProjectile");
    pew.scale.setTo(0.15,0.15);
    game.physics.arcade.enable(pew);
    pew.body.velocity.x = pipeSpeed;
    pewProjectiles.push(pew);
  }
}
function FirePew2(){
  if (ammo > 0){
    RemoveAmmo();
    var pew = game.add.sprite(player2.x,player2.y,"pewProjectile");
    pew.scale.setTo(0.15,0.15);
    game.physics.arcade.enable(pew);
    pew.body.velocity.x = pipeSpeed;
    pewProjectiles.push(pew);
  }
}

function ChangeGrav(g)
{
  currentGrav += g;
  player1.body.gravity.y = currentGrav;
  player2.body.gravity.y = currentGrav;
}

function SetGravity(g){
  startingGrav = g;
  currentGrav = g;
  player1.body.gravity.y = currentGrav;
  player2.body.gravity.y = currentGrav;
}

//ends the game by reloading the page
function GameOver(){
  registerScore(score);
  //alert("Your score was: " + score);
  score = 0;
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
  var rngesus = game.rnd.integerInRange(0,5);
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
    pew.scale.setTo(0.1,0.1);
    game.physics.arcade.enable(pew);
    pew.body.velocity.x = -pipeSpeed;
    pewPickups.push(pew);
    pickupsAll.push(pew);
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
  if (isAnnoying === true){
    game.sound.play("scoreSound");
  }
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

function Player1Jump(){
  if (jumpInvert === true){
    player1.body.velocity.y = (startingGrav - startingGrav/4);
  }
  else{
    player1.body.velocity.y = -(startingGrav - startingGrav/4);
  }
}
function Player2Jump(){
  if (jumpInvert === true){
    player2.body.velocity.y = (startingGrav - startingGrav/4);
  }
  else{
    player2.body.velocity.y = -(startingGrav - startingGrav/4);
  }
}
