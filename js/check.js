var url = "";
var request;
var form;

// リクエストを作成
function createRequest(){
  var req = false;
  if(window.XMLHttpRequest){
    req = new XMLHttpRequest();
  }
  return req;
}

function exist_user(){
    if(request.readyState == 4){
	console.log(request.responseText);
	var res = JSON.parse(request.responseText || "null");
	console.log("res = " + res["exist"]);
	if(res['exist']){
	    // ユーザ情報があるとき
	    window.location = "./task_list.html?id=" + form;
	}else{
	    var message;
	    message = "データがありませんでした。新しく作成しますか？";
	    if(confirm(message)){
		request.open("GET", "./back.rb?id=" + form + "&cmd=new", true);
		request.onreadystatechange = function(){
		    if(request.readyState == 4){
			var create_user = JSON.parse(request.responseText || "null");
			console.log(request.responseText);
			console.log(create_user);
			if(create_user["create"]){
			    window.location = "./task_list.html?id=" + form;
			}else{
			    alert("作成に失敗しました");
			}
		    }
		}
		request.send(null);
	    }else{
		message = "入力をもう一度確認してください";
		alert(message);
	    }
	}
    }
}

// フィールドに入力があるかを確認する
function check(){
    form = document.forms.form.user_id.value;
    console.log(form);
    if(form == ""){
	alert("フォームが空です。idを入力してください");
    }else{
	request = createRequest();
	url = "?id=" + form + "&cmd=exist"
	if(request){
	    request.open("GET", "./back.rb" + url, true);
	    request.onreadystatechange = exist_user;
	}
	request.send(null);
    }
}
