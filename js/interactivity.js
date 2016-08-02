var highScore = 0;
jQuery("#credits").on("click", function(){
  jQuery("#content").empty();
  var message = "I will not be named.";
  jQuery("#content").append(
    "<p>" + message + "</p>"
  );
});
jQuery("#help").on("click", function(){
  jQuery("#content").empty();
  jQuery("#content").append(
    "<p>GET OUT. NOW. BEFORE THEY COME.</p>"
  );
});
function registerScore(score){
  if (score > highScore) {
    highScore = score;
    var playerName = prompt("You beat the top score. Enter a stupid name.");
    var scoreEntry = "<li>" + playerName + ": " + score.toString() + "</li>";
    jQuery("#scoreboard").append(scoreEntry);
  }
}
$("#twitterBtn").on("click", function(){
  var message = "I wasted way too much of my life to achieve a score of: " + highScore.toString() + " on Pointless Bird: ";
  var url = "https://twitter.com/share?text=" + encodeURIComponent(message);
  $("#twitterShare").attr("href",url);
});
$("#gravBtn50").on("click", function(){
  SetGravity(50);
});
$("#gravBtn100").on("click", function(){
  SetGravity(100);
});
$("#gravBtn150").on("click", function(){
  SetGravity(150);
});
$("#gravBtn200").on("click", function(){
  SetGravity(200);
});
