// setting variables from dotenv file
require('dotenv').config({path: __dirname + '/.env'})

var apiKey      = process.env.APIKEY;
var username    = process.env.ZWIFTUSERNAME;
var password    = process.env.ZWIFTPASSWORD;
var playerId    = process.env.ZWIFTID;
var statusFile  = process.env.STATUSFILE;
var targetHr    = process.env.TARGETHR;

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

// Get profile for the user from the zwift rider
account.getProfile().profile().then(p => {
  // is the rider riding?
  if(p.riding == true){
    // if riding, check to see if fan has already been turned on in this session
    fs.exists(statusFile, function (exists) {
      if(exists){
        console.log('already told fan to turn on. skipping this round.');
        exit;
      } else { // if status file doesn't exist
        // Get the status of the specified rider
        // (includes x,y position, speed, power, etc)
        world.riderStatus(playerId).then(status => {

          // we're interested in the heart rate, though
          var rider_hr = status.heartrate;
          console.log(rider_hr);

          // if rider heartrate is over the specified target
          if(rider_hr >= targetHr){
            console.log('hr over threshold (' + rider_hr + ' > ' + targetHr + ')');

            // send fan_on event to ifttt, which will tell a smart outlet to turn on (which should trigger a fan)
            IFTTTMaker.send('fan_on').then(function () {
              console.log('fan_on request was sent');

              // writing status file, which prevents the script from hammering ifttt. it does it once.
              fs.writeFile(statusFile, {flag: 'wx'}, function (err, data){})
            }).catch(function (error) {
              console.log('fan_on request could not be sent:', error);
            });
          }
        });
      } // end if statusfile doesn't exist
    }); // close statusfile checker
  } else { // is the rider not riding?
    console.log('the rider is not riding, bub');

    // does the status file exist?
    fs.stat(statusFile, function (err, stats) {
      // if it can't check, return the error
      if (err) return console.log("couldn't check status file" + err);

      // the rider is not riding, but the status file exists?
      // that must mean the rider JUST stopped

      // ...so delete the status file
      fs.unlink(statusFile,function(err){
        if(err) return console.log("couldn't delete status file" + err);

        console.log('no longer riding, so deleting file. deleted successfully');

        // if the status file successfully deleted, send the fan_off command to ifttt
        IFTTTMaker.send('fan_off').then(function () {
          console.log('fan-off request was sent');
        }).catch(function (error) {
          console.log('The request could not be sent:', error);
        });
      });  
    });
  } // end rider is not riding
});
