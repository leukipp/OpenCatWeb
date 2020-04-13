# OpenCatWeb (v1.0)
> Web API for Petoi OpenCat Robotics

This is an extension for Petoi OpenCat robotic kittens.
It offers a local running Web API for `GET` requests with `JSON` responses.

There is also a simple web application with the following features included.
- Control individual servo positions
- Control walking mode and head with virtual joysticks
- Send commands by predefined buttons (like on IR remote control)
- Send individual commands by text (like on serial terminal)

## Requirements
### Hardware
- Working and calibrated OpenCat robot (like Nybble) with NyBoard v0_x
- Working Raspberry Pi mounted on top of NyBoard

There are no other hardware or software changes necessary on NyBoard side.
The following steps are for Raspberry Pi with Raspbian, but the code will also work on any other hardware with serial access to NyBoard.

### Software
- Working SSH or VNC access on Raspberry Pi
- Working NyBoard serial communication on Raspberry Pi
  - Follow the chapter **"Raspberry Pi serial port as interface"** in [OpenCat documentation](https://github.com/PetoiCamp/OpenCat/blob/master/Resources/AssemblingInstructions.pdf) 
  

## Installation
### Dependencies
OpenCatWeb uses `Flask` as Python Web Server Gateway Interface (WSGI).

    pip install Flask

That's it, now we need the source code of OpenCatWeb.

### Source code
Create the folder `/home/pi/Projects`.

    cd ~
    mkdir Projects
    cd Projects
    
Use `git` or download the source code as zip.

    sudo apt-get install git
    git clone https://github.com/leukipp/OpenCatWeb.git
    
You should now have the folder `/home/pi/Projects/OpenCatWeb`.


## Running 
### First start
Start the webserver at port `8080`.

    cd OpenCatWeb
    chmod +x bus.py app.py
    ./app.py

Open the web browser on another device in the same network and enter `http://<IP_OF_YOUR_RASPBERRY_PI>:8080/`.

You should see the welcome screen (more in **Usage**)
>- /web/
>- /api/

 _You can modify the webserver settings at `HOST = '0.0.0.0'` and `PORT = 8080` in `app.py` to your requirements._
_Don't change and leave `DEBUG = true`, your server won't boot up with auto start._

### Auto start on boot
_You can change the folder structure for auto start at `DAEMON=/home/pi/Projects/OpenCatWeb/app.py` in `ocw.sh` to your requirements._

    chmod +x ocw.sh 
    sudo cp ocw.sh /etc/init.d/
    sudo update-rc.d ocw.sh defaults

Reboot and check if everything is running on startup.


## Usage
The documentation of available commands is on the webserver and
in the chapter **"Arduino IDE as interface"** in [OpenCat documentation](https://github.com/PetoiCamp/OpenCat/blob/master/Resources/AssemblingInstructions.pdf).

### API
![Screenshot](https://github.com/leukipp/OpenCatWeb/blob/master/web/img/api.gif?raw=true)

I have decided to use `GET` for several reasons, most of them because of simplicity.
You don't have to use any special software to control your robot.
A simple browser bookmark is enough to do anything!

>You can navigate through all API path's until you reach the end.
>- /web/
>- /api/
>  - command/\<string:name\>
>  - communicate/
>    - u/\<int:repeat\>/\<int:tempo\>
>    - b/\<int:note>/\<int:duration\>
>  - move/
>      - m/\<int:index\>/\<int:value\>
>      - i/\<int:index\>/\<int:value\>/\<int:index\>/\<int:value\>/...
>      - l/\<int:valueofindex0>/.../\<int:valueofindex15\>
>  - stop/
>      - d
>      - p
>      - r
>  - status/
>      - j

For every `GET` request on the bottom of the list you will get a `application/json` response. For all others you will get a `text/html` response.
For status commands the API response contains the parsed text from the serial output.

Commands for calibration (c, s, a) are not implemented for safety reasons. 

### WEB
![Screenshot](https://github.com/leukipp/OpenCatWeb/blob/master/web/img/web.gif?raw=true)

On the first page you are able to send predefined commands by clicking the individual buttons.
At the bottom you have two joystick's, the left one is for walking and the right one for head movements.

On the second page you are able to control each servo separately or together if you check the checkbox on the left.
At the bottom you can send direct commands followed by the enter key.

They are some experimental features that are not working satisfying at the moment because of limitation in the serial communication.
- Auto update
  - If checked, updates from another page or movements from IR remote will be reflected here
- Lazy update
  - If unchecked, updates will occur immediately during slider movements 


#### Library
If you want to create your own application you can use the `ocw.api.js` library.
Every method returns a jQuery promise object.
``` js
let api = ocw.Api();
api.command('ksit').done((data) => {
    log.debug(data);
});
```
The library is not final and there is no further documentation about this.
For examples just check the code in `ocw.main.js`.

### Examples (Nybble)
You can use your `web browser`, `wget` or any other `script` to make the request.

Meow twice:

    http://<IP_OF_YOUR_RASPBERRY_PI>:8080/api/communicate/u/1/10
    
Tilt head:

    http://<IP_OF_YOUR_RASPBERRY_PI>:8080/api/move/m/1/0
    
Tilt and pan head:

    http://<IP_OF_YOUR_RASPBERRY_PI>:8080/api/move/i/0/0/1/0

Stand up:

    http://<IP_OF_YOUR_RASPBERRY_PI>:8080/api/command/kbalance
   
With the `/api/command/` you can send any command you like, also custom one's.


## Known Issues
- API
  - Unauthenticated and unencrypted Web API (use it only in your private network)
  - No upper/lower bound value validations (know what you send)
- WEB
  - Experimental functions are lagging in time
  - Source code is uncommented


## Changelog
> v0.3 - 2019-07-30
- WEB
  - Add mimimum/maximum value validations
> v0.2 - 2019-07-29
- API
  - Improve multiple request's behavior
- WEB
  - Add navigation menu
  - Add command buttons
  - Add joystick control
> v0.1 - 2019-07-20
- Initial release


## Thanks to
- Rongzhong, for the awesome OpenCat project and the allowance to use the Petoi logo
- Zaghaim, for the code in ardSerial.py that inspired me for the serial communication implementation

## License
[MIT](https://github.com/leukipp/OpenCatWeb/blob/master/LICENSE)
