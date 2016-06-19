# coding: utf-8
require './node'

def create_contents(hash)
  hash = symbolize_keys(hash)
  $client = Mysql2::Client.new(host: "localhost", username: "task", password: "Pace_maker1", encoding: "utf8", database: "pace")
  id = hash[:id].first.to_i
  cmd = hash[:cmd].first
  pos = hash[:pos].first.to_i if hash[:pos]
  addel_pos = hash[:addel_pos].first.to_i if hash[:addel_pos]
  add_name = hash[:add_name].first if hash[:add_name]
  add_dead = hash[:add_dead].first if hash[:add_dead]
  status = hash[:status].first.to_i if hash[:status]

  case cmd
  when 'add'
    # 追加する部分
    add(id, addel_pos, add_name, add_dead)
    node = make_tree(id).search(addel_pos)
    upgrade(id, addel_pos, node)
    view(id, pos)
  when 'del'
    # 削除する部分
    node = make_tree(id).search(addel_pos)
    parent = node.parent
    node.delete
    del(id, addel_pos)
    upgrade(id, nil, parent)
    view(id, pos)
  when 'view'
    # 表示する部分
    view(id, pos)
  when 'upgrade'
    # 進捗を更新する部分
    upgrade(id, addel_pos)
    view(id, pos)
  when 'update'
  # タスク名を更新する部分
    update(addel_pos, add_name, add_dead, status)
    upgrade(id, addel_pos)
    view(id, pos)
  when 'new'
  # 新しく作る部分
    create_user(id)
  when 'group'
  # groupの人を見る部分
  when 'exist'
    # ユーザ名が存在するかを確認する部分
    res = $client.query("select * from pace.users where user_id = #{id}")
    h = Hash.new
    if(res.entries.empty?) then
      h.store("exist", false)
    else
      h.store("exist", true)
      h.store("id", id)
      h.store("name", res.entries.first['name'])
    end
    print h.to_json
  else
    # ちゃんと作ってたら、ここには来ないはず
    puts "そんなのないよ"
  end
end

def add(id, add_pos, add_name, add_dead)
  # タスクを追加
  $client.query("insert into pace.tasks(user_id, parent_id, task_name, status, deadline) values(#{id}, #{add_pos}, '#{add_name}', 0, '#{add_dead}')")
end

def del(id, del_pos)
  id_array = [del_pos]
  id_array.each do |del_node|
    result = $client.query("select task_id from pace.tasks where parent_id = #{del_node}")
    if result.entries.empty?.! then
      result.each do |hash|
        id_array.push(hash['task_id']) if hash['task_id']
        $client.query("delete from pace.tasks where task_id = #{hash['task_id']}")
      end
    end
  end
  $client.query("delete from pace.tasks where task_id = #{del_pos}")
end

# タスク一覧を木構造化
def view(id, pos=0)
  print make_tree(id).search(pos).to_json
end

# ユーザ作成
def create_user(user_id)
  $client.query("insert into pace.users(user_id) values(#{user_id})")
  res = $client.query("select user_id from pace.users where user_id = #{user_id}")
  hash = {}
  if res.entries.empty?.! then
    array = ["テーマ決め", "調査・作成", "実験・評価", "論文執筆"]
    $client.query("insert into pace.tasks(user_id, task_name, status, deadline) values(#{user_id}, '卒業研究', 0, '#{Time.new(2017,2,28).strftime("%Y-%m-%d")}')")
    num = $client.query("select task_id from pace.tasks where user_id = #{user_id} and task_name = '卒業研究'").first['task_id']
    array.each do |task|
      $client.query("insert into pace.tasks(parent_id, user_id, task_name, status, deadline) values(#{num}, #{user_id}, '#{task}', 0, '#{Time.now.strftime("%Y-%m-%d")}')")
    end
    hash.store("create", true)
  else
    hash.store("create", false)
  end
  print hash.to_json
end

# 進捗を更新
# id: ユーザid
# pos: 更新するノードid
# addel: add/delならばnodeクラスが、それ以外ならばfalseが入ってる
def upgrade(id, pos, addel = false)
  controll = false
  if addel then
    node = addel
    node.parent_progress
  else
    node = make_tree(id).search(pos)
    node.progres_status if node
  end
  until node.root?
    $client.query("update pace.tasks set status = #{node.status} where task_id = #{node.node_id}")
    node = node.parent
  end
end

# タスク名をリネーム
def update(pos, add_name, add_dead, status)
  $client.query("update pace.tasks set task_name = '#{add_name}', deadline = '#{add_dead}', status = #{status} where task_id = #{pos}")
end
