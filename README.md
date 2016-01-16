# Fire TV Proxy
A proxy to allow the ADB control mechanism of the Amazon Fire TV Stick to be controlled through my Remote Control Chrome Extension/Mobile App

https://github.com/kevjs1982/media-player-remotes

Installation
- Ensure the adb executable is running
- Clone repo to disk
- cd \path\to\repo
- npm install
- node control.js

Then from the browser
- http://laptop.local:8080/keypress/_fireip_/_fireport_/UP

Where _fireip_ = the address of the firetv, fireport is the ADB port (usually 5555) and the last paramter is the key to press.

## Additional Functionality
- Announces the service over SSDP / UPNP (which is consumed by my media-player-remotes app)
- Announced the service over Bonjour