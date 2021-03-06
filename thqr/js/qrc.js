// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

var gCtx = null;
var gCanvas = null;
var c=0;
var stype=0;
var gUM=false;
var webkit=false;
var moz=false;
var v=null;
var t;
var cams = [];
var init = false;

var imghtml='<div id="qrfile"><canvas id="out-canvas" width="320" height="240"></canvas>'+
    '<div id="imghelp">drag and drop a QRCode here'+
	'<br>or select a file'+
	'<input type="file" onchange="handleFiles(this.files)"/>'+
	'</div>'+
'</div>';

var vidhtml = '<video id="v" autoplay></video>';

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}
function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;
  if(files.length>0)
  {
	handleFiles(files);
  }
  else
  if(dt.getData('URL'))
  {
	qrcode.decode(dt.getData('URL'));
  }
}

function handleFiles(f)
{
	var o=[];
	
	for(var i =0;i<f.length;i++)
	{
        var reader = new FileReader();
        reader.onload = (function(theFile) {
        return function(e) {
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

			qrcode.decode(e.target.result);
        };
        })(f[i]);
        reader.readAsDataURL(f[i]);	
    }
}

function initCanvas(w,h)
{
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        try{
            gCtx.drawImage(v,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showScanner(){
    $("#show_scanner_btn").css("display", "none");
    $("#outdiv").css("display", "");
    if (!init){
        load();
        return;
    }
    
    t = setTimeout(captureToCanvas, 500);
    v.play();
}

function hideScanner(){
    //showScanner();
    //return;
    
    $("#show_scanner_btn").css("display", "");
    clearInterval(t);
    //v.pause();
    //v.srcObject.getTracks()[0].stop();
    //v = null;
    //gUM = false;
    //init = false;
    $("#outdiv").css("display", "none");
}

function read(a)
{
    /*
    var html="<br>";
    if(a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html+="<a target='_blank' href='"+a+"'>"+a+"</a><br>";
    html+="<b>"+htmlEntities(a)+"</b><br><br>";
    
    $("html").html("Done");
    document.getElementById("result").innerHTML=html;
    */
    var html = "";
    if (a){
        if (a.length > 1){
            html = "Invalid QR Code";
        } else {
            var ascii = a.charCodeAt(0);
            if ((ascii >= 65 && ascii <= 90) || (ascii >= 97 && ascii <= 122)){
                var r = thqr_register(a);
                if (r == 0){
                    html = "Recorded Letter \"" + a + "\"";
                    thqr_ui_update();
                } else if (r == 1){
                    html = "The letter \"" + a + "\" has already recorded before.";
                } else {
                    html = "Error code when registering letter \"" + a + "\": " + r;
                }
            } else {
                html = "Invalid Letter \"" + a + "\"";
            }
        }
    } else {
        html = "ERROR: No data received.";
    }
    $("#result").html(html);
    hideScanner();
}	

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) 
{

    v.srcObject = stream;
    var p = v.play();

    if (p !== undefined) {
        p.catch(error => {
            $("#playbtn").html("<p>Your device does not support autoplay (especially iOS). Please press the following button to start scanning.<br /><button class=\"btn btn-success\" onclick=\"bodyOnClick()\" style=\"width: 40px; height: 40 px;\">Click to start scanning</button></p>");
            $("#outdiv").attr("style", "display: none");
        }).then(() => {
            // Auto-play started
        });
    }
    
    gUM=true;
    t = setTimeout(captureToCanvas, 500);
}

function bodyOnClick(){
    $("#outdiv").attr("style", "display: ");
    v.play();
    $("#playbtn").html("");
}
		
function error(error)
{
    gUM=false;
    return;
}

function load()
{
    if (init){
        return;
    }
    
	if(typeof(Storage) !== "undefined" && isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800, 600);
		qrcode.callback = read;
        setwebcam();
	}
	else
	{
        alert("Device not compatible");
	}
    
    init = true;
}

function selectCam(id){
	localStorage.setItem("camDevId", id);
    window.location = "qr_scan.html";
}

function unselectAllCams(){
    localStorage.removeItem('camDevId');
    window.location = 'qr_scan.html';
}

function setwebcam()
{
	var devId = localStorage.getItem("camDevId");
    var devIdExist = false;
	var options = true;
	if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
	{
		try{
			navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
            /*
			  devices.forEach(function(device) {
				if (device.kind === 'videoinput') {
                    if (devId && device.deviceId == devId){
                        devIdExist = true;
                    }
                cams.push({
                   label: device.label,
                   id: device.deviceId                   
                });
				  if(device.label.toLowerCase().search("back") >-1)
					options={'deviceId': {'exact':device.deviceId}, 'facingMode':'environment'} ;
				}
				console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
			  });
              
              if (devId && devIdExist){
				 options={'deviceId': {'exact': devId}, 'facingMode':'environment'} ;
              }
              
              var html = "";
              for (var i = 0; i < cams.length; i++){
                  html += "<p>";
                  if (devId && cams[i].id == devId){
                      html += "<b>";
                  }
                  
                  html += cams[i].label + ": " + cams[i].id;
                  
                  if (devId && cams[i].id == devId){
                      html += "</b>";
                  }
                  
                  html += " <button onclick=\"selectCam('" + cams[i].id + "')\">Select</button>";
                  html += "</p>";
              }
              html += "<p><button onclick=\"unselectAllCams();\">Unselect All</button></p>";
              
              $("#selectCam").html(html);
              */
              options={'facingMode':'environment'} ;
              
			  setwebcam2(options);
			});
		}
		catch(e)
		{
			console.log(e);
		}
	}
	else{
		console.log("no navigator.mediaDevices.enumerateDevices" );
		setwebcam2(options);
	}
	
}

function setwebcam2(options)
{
	console.log(options);
    if(stype==1)
    {
        setTimeout(captureToCanvas, 500);    
        return;
    }
    var n=navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v=document.getElementById("v");


    if(n.mediaDevices.getUserMedia)
    {
        n.mediaDevices.getUserMedia({video: options, audio: false}).
            then(function(stream){
                success(stream);
            }).catch(function(error){
                error(error)
            });
    }
    else
    if(n.getUserMedia)
	{
		webkit=true;
        n.getUserMedia({video: options, audio: false}, success, error);
	}
    else
    if(n.webkitGetUserMedia)
    {
        webkit=true;
        n.webkitGetUserMedia({video:options, audio: false}, success, error);
    }
    
    

    stype=1;
    t = setTimeout(captureToCanvas, 500);
}

function setimg()
{
	document.getElementById("result").innerHTML="";
    if(stype==2)
        return;
    document.getElementById("outdiv").innerHTML = imghtml;
    //document.getElementById("qrimg").src="qrimg.png";
    //document.getElementById("webcamimg").src="webcam2.png";
    document.getElementById("qrimg").style.opacity=1.0;
    document.getElementById("webcamimg").style.opacity=0.2;
    var qrfile = document.getElementById("qrfile");
    qrfile.addEventListener("dragenter", dragenter, false);  
    qrfile.addEventListener("dragover", dragover, false);  
    qrfile.addEventListener("drop", drop, false);
    stype=2;
}