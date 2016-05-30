// クリックで選択している要素のid保持
var node_id = -1;
// statusの文句配列
var status_array = ["未着手...", "進行中", "終了！"];

window.onload = function(){
    console.log("きたよ");
    var target = document.getElementsByClassName("task_list")[0];
    target.addEventListener("click", listener, false);
    var id = location.search.substr(4);
    console.log(id);
    send(id, "view", 0);
}

// クリックした要素の色を変える
function listener(target){
    if(ev.target.id){
	console.log(node_id);
	if(node_id > 0){
	    document.getElementById(node_id).style.color = "";
	}
	node_id = ev.target.id;
	document.getElementById(node_id).style.color = "red";
    }else{
	if(node_id > 0){
	    document.getElementById(node_id).style.color = "";
	}
    }
    console.log(node_id);
}

function create_request(){
    var request = false;
    if(window.XMLHttpRequest){
	request = new XMLHttpRequest();
    }
    return request;
}

// サーバへ要求を送る
function send(user_id, cmd, pos, node_id, add_name, deadline){
    var request = create_request();
    var json = "";
    var url = "?id=" + user_id + "&cmd=" + cmd + "&pos=" + pos;

    switch(cmd){
    case 'add':
	url +=  "&data=" + add_name + "&data=" + deadline;
	break;
    case 'del':
    case 'upgrade':
	url += "&data=" + node_id;
	break;
    }

    console.log(url);

    if(request){
	request.open("GET", "./back.rb" + url, true);
	request.onreadystatechange = function(){
	    if(request.readyState == 4){
		console.log(request.responseText);
		res = request.responseText;
		if(res != ''){
		    json = JSON.parse(res);
		    console.log(json);
		    document.getElementsByClassName("task_list")[0].innerHTML = rewrite_page(json, pos, user_id);
		}else{
		    alert("データの追加/削除/更新に失敗しました");
		}
	    }
	}
	request.send(null);
	n_id = 0;
    }
}


function rewrite_page(json, pos, user_id){
    var content = "";
    for(var num in json){
	var node = json[num].node;
	console.log(node);
	content += "<li>\n";
	content += '<span id=' + node.node_id + '>' + "\n";
	content += node.task_name + ",";
	content += node.deadline + ",";
	content += status_array[node.status] + "\n";
	content += "</span>\n";
	if(json[num].child.length != 0){
	    content += rewrite_page(json[num].child);
	}
	content += "</li>\n";
    }
    return "<ol>\n" + content + "</ol>\n";
}
B
