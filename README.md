# ZwIFTTT


## About
This is a node script designed to run as a service. It monitors Zwift for a specific rider. Once that rider's heart rate exceeds a value you set, it will fire a request to IFTTT which is (hopefully) hooked up to a smart plug of your choice. In that plug can be a fan, light, whatever you'd like.

## Requirements
1) A Zwift account
2) An IFTTT account
3) A smart plug of your choice (example: Wemo)

## Setup & Installation
1) Clone this repository
2) Run ```npm install``` to install the required node modules
3) cp the ```start.sh.example``` to ```start.sh```
4) Replace the ```/path/to/your...``` strings with the path to your script
5) cp the ```dotenv.example``` to ```.env``` and modify its values to match your Zwift user and settings. (If you aren't sure what your Zwift rider ID number is, use a utility like http://www.virtualonlinecycling.com/p/zwiftid.html)
6) Go to IFTTT and add two services:
- IF: Webhooks request for fan_on THEN: power on [smart plug of your choice]
- IF: Webhooks request for fan_off THEN: power off [smart plug of your choice]

## Testing
1) Log into Zwift and starting a ride with your heart rate monitor connected
2) Temporarily set the TARGETHR value in your .env to 10 (a number that can be exceeded immediately)
3) Manually run ```start.sh```
4) If the fan turns on within 30 seconds, the ON phase of the integration works!
5) Close Zwift (discard the ride)
6) If the fan turns off within 30 seconds, the OFF phase of the integration works!
7) Reset the TARGETHR value back to your desired target

## Putting into Production
1) Set up a service in your OS to run start.sh on boot (or however you prefer)
