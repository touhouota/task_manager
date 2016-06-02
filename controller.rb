# coding: utf-8
require './node'

def create_contents(hash)
  hash = symbolize_keys(hash)
  $client = Mysql2::Client.new(host: "localhost", username: "task", password: "Pace_maker1", encoding: "utf8", database: "pace")
  id = hash[:id].first.to_i
  cmd = hash[:cmd].first

  case hash.length
  when 3
    # view
    pos = hash[:pos].first.to_i if hash[:pos]
  when 4
    # del
    pos = hash[:pos].first.to_i if hash[:pos]
    addel_pos = hash[:addel_pos].first.to_i if hash[:addel_pos]
  when 6
    # add
    pos = hash[:pos].first.to_i if hash[:pos]
    addel_pos = hash[:addel_pos].first.to_i if hash[:addel_pos]
    add_name = hash[:add_name].first if hash[:add_name]
    add_dead = hash[:add_dead].first if hash[:add_dead]
  end

  case cmd
  when 'add'
    # 追加する部分
    add(id, addel_pos, add_name, add_dead)
    view(id, pos)
  when 'del'
    # 削除する部分
    del(id, addel_pos)
    view(id, pos)
  when 'view'
    # 表示する部分
    view(id, pos)
  when 'new'
  # 新しく作る部分
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
  id_array.each do |id|
    result = $client.query("select task_id from pace.tasks where parent_id = #{id}")
    if result.entries.empty?.! then
      result.each do |hash|
        id_array.push(hash['task_id']) if hash['task_id']
        $client.query("delete from pace.tasks where task_id = #{hash['task_id']}")
      end
    end
  end
  $client.query("delete from pace.tasks where task_id = #{del_pos}")
end

def view(id, pos=0)
  print make_tree(id).search(pos).to_json
end
