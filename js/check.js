var url = "";

// リクエストを作成
function createRequest(){
  var request = false;
  if(window.XMLHttpRequest){
    request = new XMLHttpRequest();
  }
  return request;
}

// フィールドに入力があるかを確認する
function check(){
    var form = document.forms.form.user_id.value;
    console.log(form);
    if(form == ""){
	alert("フォームが空です。idを入力してください");
    }else{
	var request = createRequest();
	url = "?id=" + form + "&cmd=exist"
	if(request){
	    request.open("GET", "./back.rb" + url, true);
	    request.onreadystatechange = function(){
		if(this.readyState == 4){
		    var res = this.responseText;
		    console.log(res);
		    res = JSON.parse(res);
		    var message;
		    console.log("res = " + res["exist"]);
		    if(res['exist']){
			// ユーザ情報があるとき
			window.location = "./task_list.html"
		    }else{
			message = "データがありませんでした。新しく作成しますか？";
			if(confirm(message)){
			    window.location = "./task_list.html"
			}else{
			    message = "入力をもう一度確認してください";
			    alert(message);
			}
		    }
		}
	    }
	}
	request.send(null);
    }
}
