// クリックで選択している要素のid保持
var node_id = 0;
// statusの文句配列
var status_array = ["未着手...", "進行中", "終了！"];
var id;

window.onload = function(){
    console.log("きたよ");
    var target = document.getElementsByClassName("task_list")[0];
    target.addEventListener("click", listener, false);
    // 読み込み時に、最上位ノードを表示
    id = location.search.substr(4);
    console.log(id);
    document.getElementsByClassName("user_name")[0].innerHTML = id;
    send(id, "view", 0);
    document.forms.controll_form.pos.value = "0";
}

// クリックした要素の色を変える
function listener(ev){
    if(ev.target.id){
	console.log("first:" + node_id);
	if(node_id > 0){
	    document.getElementById(node_id).style.color = "";
	}
	node_id = ev.target.id;
	document.getElementById(node_id).style.color = "red";
    }else{
	if(node_id > 0){
	    document.getElementById(node_id).style.color = "";
	}
	node_id = 0;
    }
    console.log("end: " + node_id);
}

function create_request(){
    var request = false;
    if(window.XMLHttpRequest){
	request = new XMLHttpRequest();
    }
    return request;
}

// フォームから情報をとってsendする
function get_form(cmd){
    var form = document.forms.controll_form;
    var task_name = form.task_name.value;
    var date = form.date.value;
    var pos = form.pos.value;
    console.log(task_name);
    if(task_name != ""){
	send(id, cmd, pos, task_name, date);
    }else{
	alert("タスク名が空です。何か入力してください");
    }
}

// サーバへ要求を送る
function send(user_id, cmd, pos, add_name, deadline){
    var request = create_request();
    var json = "";
    var url = "?id=" + user_id + "&cmd=" + cmd + "&pos=" + pos;

    switch(cmd){
    case 'add':
	url +=  "&add_name=" + add_name + "&addel_pos=" + node_id  + "&add_dead=" + deadline;
	break;
    case 'del':
    case 'upgrade':
	url += "&addel_pos=" + node_id;
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
		    console.log(node_id);
		}else{
		    alert("データの追加/削除/更新に失敗しました");
		}
	    }
	}
	request.send(null);
	node_id = 0;
	
    }
}


// サーバからの返答によってHTMLを書き換える関数
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
