// クリックで選択している要素のid保持
var node_id = 0;
// statusの文句配列
var status_array = ["未着手...", "進行中", "終了！"];
var id;

window.onload = function(){
    var target = document.getElementById("task_list");
    target.addEventListener("click", listener, false);
    target.addEventListener("dblclick", double_click, false);
    // 読み込み時に、最上位ノードを表示
    id = location.search.substr(4);
    var tmp = decodeURIComponent(document.cookie);
    console.log(document.cookie);
    document.getElementsByClassName("user_name")[0].innerHTML = id;
    send(id, "view", 0);
    send(id, "group", 0);
    document.forms.controll_form.pos.value = "0";
    var time = 1000 * 60; // ミリ秒を分へ変換
    setInterval(repetition, time * 2);
}

// クリックした要素の色を変える
function listener(ev){
    console.log(ev.target.parentElement);
    if(ev.target.parentElement.tagName.toLowerCase() != 'form'){
	// クリックしたものが、フォームでないときは要素の選択をしてる時
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
    }else{
	// クリックしたものがフォームの時は、タスク名を変更している時
    }
    console.log("end: " + node_id);
}

function double_click(ev){
    if(ev.target.id){
	var click_pos = document.getElementById(ev.target.id);
	var parent = click_pos.parentElement;
	var inputs = [];
	for(var i = 0; i < 2; i++){
	    inputs.push(document.createElement('input'));
	}
	inputs.push(document.createElement("select"));
	var content = click_pos.innerHTML.replace(/\r?\n/g, "").split(',');
	console.log(content);

	// タスク名
	inputs[0].name = "add";
	inputs[0].value = content[0];

	// 日付
	inputs[1].name = "date";
	inputs[1].type = "date";
	inputs[1].value = content[1];

	// 進捗部分(セレクタにする)
	inputs[2].id="status";
	inputs[2].name = "status";
	inputs[2].onblur = check_blur;
	for(var i in status_array){
	    var node = document.createElement('option');
	    node.innerHTML = status_array[i];
	    node.id = i;
	    if(status_array[i] == content[2]){
		node.selected = "selected";
	    }
	    inputs[2].appendChild(node);
	}
	var form = document.createElement('form');
	form.id = click_pos.id;
	form.className = click_pos.className;
	parent.insertBefore(form, click_pos);

	for(var i in inputs){
	    inputs[i].onblur = check_blur;
	    form.appendChild(inputs[i]);
	}
	parent.removeChild(click_pos);
    }
}

// 一定時間、繰り返す内容をここに
function repetition(){
    var pos = document.forms.controll_form.pos.value;
    console.log("グループメンバーの進捗確認するよ");
    send(id, 'group', pos);
}

function create_request(){
    if(window.XMLHttpRequest){
	return new XMLHttpRequest();
    }
    return false;
}

// フォームから情報をとってsendする
function get_form(cmd){
    var form = document.forms.controll_form;
    var task_name = form.task_name.value;
    var date = form.date.value;
    var pos = form.pos.value;
    console.log(task_name);
    if(cmd == "add"){
	// タスク追加時に、タスク名がない時はアラートを出す
	if(task_name != ""){
	    send(id, cmd, pos, task_name, date);
	    form.task_name.value = "";
	}else{
	    alert("タスク名が空です。何か入力してください");
	}
    }else{
	send(id, cmd, pos, task_name, date);
    }
}

// サーバへ要求を送る
function send(user_id, cmd, pos, add_name, deadline, status){
    var request = create_request();
    var json = "";
    var url = "?id=" + user_id + "&cmd=" + cmd + "&pos=" + pos;
    var add_name_escape = encodeURIComponent(add_name);
    switch(cmd){
    case 'add':
	url +=  "&add_name=" + add_name_escape + "&addel_pos=" + node_id  + "&add_dead=" + deadline;
	break;
    case 'update':
	url +=  "&add_name=" + add_name_escape + "&addel_pos=" + node_id  + "&add_dead=" + deadline + "&status=" + status;
    case 'del':
    case 'upgrade':
	url += "&addel_pos=" + node_id;
	break;
    case 'group':
	url += "&group=" + 1;
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
		    var json = JSON.parse(res);
		    console.log(json);
		    if(cmd == 'group'){
			// グループを表示する時は、こっち
			document.getElementById('group').innerHTML = rewrite_page(json);
		    }else{
			// それ以外は、自分のところに出力
			document.getElementById("task_list").innerHTML = rewrite_page(json);
		    }
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
function rewrite_page(json){
    var content = "";
    for(var num in json){
	console.log(json[num]);
	var node = json[num].node;
	//console.log(json[num].node);
	content += "<li>\n";
	content += '<span id="' + node.node_id + '" class="status' + node.status  + '">' + "\n";
	content += node.task_name + ",";
	content += node.deadline;
	content += "," + status_array[node.status] + "\n";
	content += "</span>\n";
	if(json[num].child.length != 0){
	    content += rewrite_page(json[num].child);
	}
	content += "</li>\n";
    }
    return "<ol>\n" + content + "</ol>\n";
}

// フォーカスが外れた時
function check_blur(){
    var form = document.getElementById(node_id);
    //console.log(form);
    var add = form.add.value;
    var deadline = form.date.value;
    var pos = document.forms.controll_form.pos.value;
    // 進捗は、そのノードのクラス名：statusXのX部分にあるため
    var status = form.className.replace("status", "");
    send(id, "update", pos, add, deadline, status);
    console.log("send!!");
}

/////////////////////////////////////////////////////////////////////////
/// canvas 部分
/////////////////////////////////////////////////////////////////////////

var canvas = document.getElementById("can");
var context = canvas.getContext("2d");
context.fillStyle = "#fff";
context.fillRect(0, 0, canvas.width, canvas.height);
