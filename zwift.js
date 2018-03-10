// setting variables from dotenv file
require('dotenv').config({path: __dirname + '/.env'})

var apiKey = process.env.APIKEY;
var username = process.env.ZWIFTUSERNAME;
var password = process.env.ZWIFTPASSWORD;
var playerId = process.env.ZWIFTID;
var statusFile = process.env.STATUSFILE;

// requiring zwift api
var ZwiftAccount = require("zwift-mobile-api");

// requiring filesystem handling
var fs = require('fs');

// requiring ifttt api
var IFTTTMaker = require('iftttmaker')(apiKey);

// initializing zwift integration
var account = new ZwiftAccount(username, password);

// gets a list of all the riders in the world.
// it's always world1, regardless of the one currently running in zwift. shrug.
var world = account.getWorld(1);

// Get profile for "me"
account.getProfile().profile().then(p => {
    console.log(p.riding);  // JSON of rider profile (includes id property you can use below)

    if(p.riding == true){
      // if riding, check to see if fan has already fired
      fs.exists(statusFile, function (exists) {
        if(exists){
          console.log('already told fan to turn on. exiting.');
          exit;
        } else {
          fs.writeFile(statusFile, {flag: 'wx'}, function (err, data){})

      // Get the status of the specified rider
      // (includes x,y position, speed, power, etc)
      world.riderStatus(playerId).then(status => {
        var rider_hr = status.heartrate;

        console.log(rider_hr); // heart rate of rider

        // if rider heartrate is over 140bpm...
        if(rider_hr >= 140){
          console.log('hr over 140');

          // send 150_bpm event to ifttt, which will tell a smart outlet to turn on (which should trigger a fan)
          // the trigger is named 150_bpm but i have it triggering at 140 which seems better
          IFTTTMaker.send('150_bpm').then(function () {
            console.log('Request was sent');
          }).catch(function (error) {
            console.log('The request could not be sent:', error);
          });
	}
      });
        }
      });
    } else {
      console.log('not riding, bub');
      fs.stat(statusFile, function (err, stats) {
        console.log(stats); // all information of file in stats variable

        if (err) {
          return console.error(err);
        }

        fs.unlink(statusFile,function(err){
          if(err) return console.log(err);

          console.log('no longer riding, so deleting file. deleted successfully');
        });  
      });
    }
});
