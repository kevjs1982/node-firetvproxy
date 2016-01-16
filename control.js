//Lets require/import the HTTP module
var http = require('http');
var bonjour = require('bonjour')();
var adb = require('adbkit');
var url   = require('url');
var fs = require('fs');
var ipaddr = require('ip');
const PORT=8080;  
  var Server = require('node-ssdp').Server
      , server = new Server({
    location: "http://" + ipaddr.address() + ":" + PORT + '/desc.xml'
  })
    
var keys = new Object();
keys['UP'] = 19;
keys['DOWN'] =  20
keys['LEFT'] =  21
keys['RIGHT'] =  22
keys['ENTER'] =  66
keys['BACK'] =  4
keys['HOME'] =  3
keys['MENU'] =  1
keys['PLAYPAUSE'] =  85
keys['PREVIOUS'] =  88
keys['NEXT'] =  87



// advertise an HTTP server on port 3000 
bonjour.publish({ name: 'Fire TV Control', type: 'http', port: PORT })
//Lets define a port we want to listen to
var client = adb.createClient();


    
    server.addUSN('upnp:rootdevice');
    server.addUSN('urn:firecontrol-kjs-me-uk:device:control:1');
    server.addUSN('urn:firecontrol-kjs-me-uk:service:control:1');
    //server.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');
    
    server.on('advertise-alive', function (heads) {
      // Expire old devices from your cache. 
      // Register advertising device somewhere (as designated in http headers heads) 
    });
    
    server.on('advertise-bye', function (heads) {
      // Remove specified device from cache. 
    });
    
    server.start();
	
	
//We need a function which handles requests and send response
function handleRequest(request, response)
{
	//console.log(request.url);
	var uri = url.parse(request.url);
	var path = uri.path.split("/");
	var ip = path[2] != "" ? path[2] : '127.0.0.1';
	var port = path[3] != "" ? path[3] : '5555';
	switch(path[1])
	{
		case 'desc.xml':
		response.writeHead(200, {'Content-Type': 'text/xml'});
		response.write('<root xmlns="urn:schemas-upnp-org:device-1-0">');
		response.write("<specVersion><major>1</major><minor>0</minor></specVersion>");
		response.write("<URLBase>http://" + ipaddr.address() + ":" + PORT +"</URLBase>");
response.write("<device>");
response.write("<deviceType>urn:firecontrol-kjs-me-uk:device:control:1</deviceType>");
response.write("<friendlyName>Fire TV Control</friendlyName>");
response.write("<manufacturer>Kev Swindells</manufacturer>");
response.write("<modelName>Fire TV Control</modelName>");
response.write("<UDN>uuid:74d41391-bfdc-038c-c2af-f935e14aef7f</UDN>");
response.write("<serviceList>");
response.write("<service>");
response.write("<serviceType>urn:firecontrol-kjs-me-uk:service:control:1</serviceType>");
response.write("<serviceId>urn:firecontrol-kjs-me-uk:serviceId:control</serviceId>");
response.write("<controlURL>/ssdp/notfound</controlURL>");
response.write("<eventSubURL>/ssdp/notfound</eventSubURL>");
response.write("</service>");
response.write("</serviceList>");
response.write("</device>");
response.write("</root>");

response.end('');
break;
		case 'keypress':
			var key = (typeof(keys[path[4]])!='undefined') ? keys[path[4]] : keys[path[4]];
			client.shell(ip + ":" + port,"input keyevent " + key);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write("<title>FireTV</title>");
			response.end('OK');
			break;
		case 'screen':
			client.shell(ip + ":" + port,"screencap -p /sdcard/screen.png")
			.then(client.pull(ip + ":" + port , '/sdcard/screen.png'))
			.then(function(transfer)
				{
					return new Promise(function(resolve, reject) 
						{
							var fn = 'screen.png';
							transfer.on('progress', function(stats)
							{
								console.log('[%s] Pulled %d bytes so far',"",stats.bytesTransferred)
							})
							transfer.on('end', function() 
							{
								console.log('[%s] Pull complete', "")
								resolve(ip + ":"  + port)
								
							})
							transfer.on('error', function(err) { console.log(err)})
							transfer.pipe(fs.createWriteStream(fn))
							
						})
				})
			.then(function() { console.log("done") })
			.catch(function(err) {
				console.error('Something went wrong:', err.stack)
			})
			response.write("<title>FireTV</title>");
			response.end("");
			break;
		default:
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.end('File Not Found: ' + path);
	}
}

var httpserver = http.createServer(handleRequest);
httpserver.listen(PORT, function()
{
    console.log("Server listening on: http://localhost:%s", PORT);
});

 

    process.on('exit', function(){
      server.stop() // advertise shutting down and stop listening
    })