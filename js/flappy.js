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
var gapSize = 150;
var gapMargin = 50;
var pipeEndHeight = 25;
var pipeEndWidth = 60;
var scoreText;
var player;
var jumpInvert = false;
var pipes = [];
var balloons = [];
var weights = [];
var inverts = [];
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', stateActions);
/*
 * Loads all resources for the game and gives them names.
 */
function preload() {
  game.load.image("playerImg", "../assets/flappy-cropped.png");
  game.load.image("endImage", "../assets/pipe-end.png");
  game.load.image("backgroundImage", "../assets/bg1.jpg");
  game.load.audio("scoreSound", "../assets/point.ogg");
  game.load.image("pipe", "../assets/pipe.png");
  game.load.image("balloonImg", "../assets/balloons.png");
  game.load.image("weightImg", "../assets/weight.png");
  game.load.image("invertImg", "../assets/invert.png");
  game.physics.startSystem(Phaser.Physics.ARCADE);
}

/*
 * Initialises the game. This function is only called once.
 */
function create() {
    currentGrav = startingGrav;
    jumpInvert = false;
    // set the background colour and image of the scene
    game.stage.setBackgroundColor("#99ff99");
    game.add.image(0,0,"backgroundImage");
    //set up player
    player = game.add.sprite(width/2, height/2, "playerImg");
    game.physics.arcade.enable(player);
    player.body.gravity.y = startingGrav;
    player.anchor.setTo(0.5,0.5);
    //pointless message
    game.add.text(60,20,"You are sad, stop wasting your life playing this useless game.",{font:"20px Times",fill:"#19D2D5"});
    //get spacebar input
    game.input
      .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      .onDown.add(playerJump);
    game.input
      .keyboard.addKey(Phaser.Keyboard.ESC)
      .onDown.add(PauseGame);
    //set up score counter
    scoreText = game.add.text(0,0,"0");
    //start pipe generation
    var pipeInterval = 2 * Phaser.Timer.SECOND;
    game.time.events.loop(pipeInterval,GeneratePipe);
}

/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
  //probably useless score update
  scoreText.setText(score.toString());
  player.rotation = Math.atan(player.body.velocity.y/200);
  //check for collisions
  game.physics.arcade.overlap(player, pipes, GameOver);
  if (player.y < 0 || player.y > height){
    GameOver();
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
  game.paused = true;
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
    game.paused = false;
  }
  else{
    game.paused = true;
  }
}

function AddPickup(y)
{
  var rngesus = game.rnd.integerInRange(0,3);
  if (rngesus === 0)
  {
    var balloon = game.add.sprite(width, y, "balloonImg");
    game.physics.arcade.enable(balloon);
    balloon.body.velocity.x = -pipeSpeed;
    balloons.push(balloon);
  }
  if(rngesus === 1)
  {
    var weight =  game.add.sprite(width, y, "weightImg");
    game.physics.arcade.enable(weight);
    weight.body.velocity.x = -pipeSpeed;
    weights.push(weight);
  }
  if (rngesus === 2)
  {
    var invert = game.add.sprite(width, y, "invertImg");
    invert.scale.setTo(0.1,0.1);
    game.physics.arcade.enable(invert);
    invert.body.velocity.x = -pipeSpeed;
    inverts.push(invert);
  }
}

function AddPipeEnd(y)
{
  var end = game.add.sprite(width - (pipeEndWidth - blockHeight)/2, y + blockHeight/2, "endImage");
  game.physics.arcade.enable(end);
  end.body.velocity.x = -pipeSpeed;
  pipes.push(end);
}

function GeneratePipe()
{
  if (isAnnoying === true){
    game.sound.play("scoreSound");
  }
  score = addOne(score);
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
}

function playerJump(){
  if (jumpInvert === true){
    player.body.velocity.y = (startingGrav - startingGrav/4);
  }
  else{
    player.body.velocity.y = -(startingGrav - startingGrav/4);
  }
}
//most utterly pointless piece of code I've ever written
function addOne(input){
  return input + 1;
}
