var oneDay = 24*60*60*1000;
var latestRelease = new Date("2022-02-26T08:00:00-06:00"); // Newest Episode Release
var nextRelease = new Date("2022-03-05T08:00:00-06:00"); // Next Episode release
var mode = 0; //DD:HH:MM:SS mode is default
var lastHiatusMention = null;

//voodoo magic
function GetThen(yourUrl, onload){
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET",yourUrl,true);
  Httpreq.onload = function() {
    if (Httpreq.readyState === Httpreq.DONE && Httpreq.status === 200) {
      onload(Httpreq.responseText);
    }
  };
  Httpreq.send(null);
}

//Initially loads the last 100 posts on subreddit
function requestSubredditData(after = null) {
  var url = 'https://www.reddit.com/r/BigCityGreens/new.json?limit=100';
  GetThen(after ? url + '&after=' + after : url, checkSubreddit);
}
  
//looks at the loaded posts, this runs four times every half-second
function checkSubreddit(response){
  var subbredditJSON = JSON.parse(response);
  var lastHiatusMentionThisCheck;
  //list of words that counts as a mention of the hiatus
  var keywords = ["hiatus"];
  for(var i = 0; i < 100; i++){
    for(var j = 0; j < keywords.length; j++){
      //checks only post titles and post content if self-post
      if(subbredditJSON.data.children[i].data.selftext.toLowerCase().includes(keywords[j]) == true || subbredditJSON.data.children[i].data.title.toLowerCase().includes(keywords[j]) == true){
        lastHiatusMentionThisCheck = new Date(subbredditJSON.data.children[i].data.created_utc * 1000);
        document.getElementById("hiatusLink").href = "https://reddit.com" + subbredditJSON.data.children[i].data.permalink;
        i = 100;
      };
    };
  };
  //loads the next 100 if hiatus is not mentioned then runs the function again
  if (lastHiatusMentionThisCheck == null) {
    requestSubredditData(subbredditJSON.data.after);
  } 
  else {
    lastHiatusMention = lastHiatusMentionThisCheck;
  }
};

function switchMode(){
  if(mode == 0){
    //switch to DD:HH:MM:SS mode
    mode = 1;
    document.getElementById("moreorless").innerHTML = "to return to normal.";
  }
  else if(mode == 1){
    //DD:HH:MM:SS mode
    mode = 0;
    document.getElementById("moreorless").innerHTML = "to count less precisely instead.";
  };
};

function timer(updown, zeroTime, id){
  if (!zeroTime) {
    return null;
  }

  var timeNow = new Date();
  if (updown == "up"){
    var diffDays = (timeNow.getTime() - zeroTime.getTime()) / oneDay;
  }
  else if (updown == "down"){
    var diffDays = (zeroTime.getTime() - timeNow.getTime()) / oneDay;
  }

  var diffHours = (diffDays - Math.floor(diffDays)) * 24;
  var diffMinutes = (diffHours - Math.floor(diffHours)) * 60;
  var diffSeconds = (diffMinutes - Math.floor(diffMinutes)) * 60;

  //Removes all decimal places in each portion
  diffDays = Math.floor(diffDays);
  diffHours = Math.floor(diffHours);
  diffMinutes = Math.floor(diffMinutes);
  diffSeconds = Math.floor(diffSeconds);

  if (mode == 0){
    document.getElementById(id).innerHTML =  diffDays + "d : " + diffHours + "h : " + diffMinutes + "m : " + diffSeconds + "s";
    document.getElementById(id).style.fontSize = "100%";
  }
  else if (mode == 1){
    if (diffDays == 1){
      document.getElementById(id).innerHTML =  diffDays + " Day";  
    }
    else if (diffDays == 0){
      document.getElementById(id).innerHTML =  diffHours + " Hours";
    }
    else {
      document.getElementById(id).innerHTML =  diffDays + " Days";    
    }
    document.getElementById(id).style.fontSize = "100%";
  }
  else if (mode == 2){
    var totalTime = diffSeconds + (diffMinutes * 60) + (diffHours * 3600) + (diffDays * 86400);
    document.getElementById(id).innerHTML = totalTime.toLocaleString() + " Seconds";
  };
  if (updown == "down" && diffDays < 0){
    document.getElementById(id).innerHTML =  "Time's Up!";
  }
  return diffDays
};
  
//The Grand Array of Hiatuses
var hiatusList = [
  ['Last Episode','Next Episode','Preceding Release','Following Release','Hiatus Length','Note'],
  ['Coffee Quest; Phoenix Rises','Blood Moon','Aug 8 2018','Oct 6 2018',59,'Halloween Special'],
  ['Blood Moon','Big Deal; Forbidden Feline','Oct 6 2018', 'Nov 3 2018',28,'Thanksgiving Special'],
  ['Big Deal; Forbidden Feline', 'Uncaged', 'Nov 3 2018', 'Jan 11 2019',69,''],
  ["Cricket's Place; Volunteer Tilly", "Cricket's Kapowie; Car Trouble", 'Mar 9 2019', 'Nov 16 2019',252,''],
  ['Reckoning Ball; Clubbed', 'Impopstar; Football Camp', 'Dec 14 2019', 'Jan 11 2020',28,''],
  ['Garage Tales; Animal Farm', 'Desserted; The Gifted', 'Feb 8 2020', 'Jul 11 2020',154,''],
  ['Quiet Please; Chipwrecked', 'Chipocalypse Now', 'Sep 19 2020', 'Jan 16 2021',119,''],
  ["Cousin Jilly; Gloria's Café", 'Squashed!', 'Apr 3 2021', 'Oct 9 2021',189,'Halloween Special'],
  ['Squashed!', 'Boss Life; Papaganda', 'Oct 9 2021','Feb 12 2022',126,'']
];
  
function hiatusRankCheck(){
  var diffDays = timer("up", latestRelease, "count");
  var hiatusRank = 0;
  var nextHiatusLength = hiatusList[8][4]; //reference to the longest hiatus
  for(var i = 1; i < hiatusList.length; i++){
    if(hiatusList[i][4] > diffDays){
      hiatusRank += 1;
      if(hiatusList[i][4] < nextHiatusLength){
        nextHiatusLength = hiatusList[i][4];
      }
    }
  }
  var suffix;
    if(hiatusRank % 10 == 1 && hiatusRank != 11){
      suffix = "st";
    }
    else if(hiatusRank % 10 == 2 && hiatusRank != 12){
      suffix = "nd";
    }
    else if(hiatusRank % 10 == 3 && hiatusRank != 13){
      suffix = "rd";
    }
    else if(hiatusRank == 0){
      suffix = "The";
    }
    else suffix = "th";
    if(hiatusRank > 0){
      document.getElementById("hiatusRank").innerHTML =  hiatusRank + suffix;
    }
    else{
      document.getElementById("hiatusRank").innerHTML =  suffix;
    }
    document.getElementById("nextHiatusLength").innerHTML =  nextHiatusLength;
    var nextHiatusLengthDate = new Date(latestRelease.getTime() + (nextHiatusLength * 86400000));
    return nextHiatusLengthDate;
  }
  
//makes an HTML table from the array
function createTable(array) {
  var diffDays = timer("up", latestRelease, "count");
  array[array.length - 1][4] = diffDays + " days and counting";
  for(var i = 0; i < array.length ; i++){
    var row = document.createElement('tr');
    row.setAttribute("id", "myTr" + i);
    document.getElementById("hiatus").appendChild(row);
    for(var j = 0; j < 6; j++){
      var cell = document.createElement('td');
      var content = document.createTextNode(array[i][j]);
      cell.appendChild(content);
      document.getElementById("myTr" + i).appendChild(cell);
    };
  };
};
  
//does the ticking
window.setInterval(function(){
  timer("up", latestRelease, "count");
  timer("down", hiatusRankCheck(), "count2");
  timer("up", lastHiatusMention, "count3");
  timer("down", nextRelease, "count4"); //Comment out when no new release date
}, 250);
  
//every 30 seconds, the most recent 100 posts on the subreddit are loaded up again in case there has been a new post that mentions hiatus
window.setInterval(requestSubredditData, 30000);
