var chars = [];
var events = [];

$(document).ready(function(){
    thqr_dataload();
});

function thqr_ui_update(){
    var n = thqr_num_of_matches();
    $("#matched-num").html(n);
    $("#left-num").html(26 - n);
    $("#rec-num").html(chars.length);
}

function thqr_num_of_matches(){
    var skip = [];
    var c = 0;
    var i;
    for (i = 0; i < chars.length; i++){
        if (skip.includes(chars[i])){
            continue;
        }
        
        var ascii = chars[i].charCodeAt(0);
        if (ascii >= 65 && ascii <= 90){
            var smallchar = String.fromCharCode(ascii + 32);
            if (chars.includes(smallchar)){
                skip.push(smallchar);
                c++;
            }
        } else if (ascii >= 97 && ascii <= 122){
            var bigchar = String.fromCharCode(ascii - 32);
            if (chars.includes(bigchar)){
                skip.push(bigchar);
                c++;
            }
        }
    }
    return c;
}

function thqr_register(ch, autosave = true){
    var r = thqr_add_char(ch);
    if (r == 0){
        thqr_add_event(ch);
        if (autosave){
            thqr_datasave();
        }
        return 0;
    } else {
        return r;
    }
}

function thqr_add_char(ch){
    if (!chars.includes(ch)){
        chars.push(ch);
        return 0;
    } else {
        return 1;
    }
}

function thqr_add_event(ch){
    events.push({
       t: new Date().getTime(),
       ch: ch       
    });
}

function thqr_dataraw(){
    thqr_dataload();
    thqr_datasave();
    return localStorage.getItem("thqr_data");
}

function thqr_datasave(){
    var o = {
        c: chars,
        e: events
    };
    localStorage.setItem("thqr_data", JSON.stringify(o));
}

function thqr_dataload(){
    var str = localStorage.getItem("thqr_data");
    
    if (str){
        var json = JSON.parse(str);
        if (!json){
            alert("Data Error: " + str);
            return;
        }
        chars = json.c;
        events = json.e;
    }
}