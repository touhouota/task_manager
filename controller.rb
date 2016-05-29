# coding: utf-8
require './node'

def create_contents(hash)
  hash = symbolize_keys(hash)
  id = hash[:id].first.to_i
  cmd = hash[:cmd].first
  pos = hash[:pos].first.to_i if hash[:pos]
  data = hash[:data]

  case cmd
  when 'add'
    # 追加する部分
    add(id, pos, data)
  when 'del'
    # 削除する部分
    delete(id, pos)
  when 'view'
    # 表示する部分
    view(id, pos)
  when 'new'
  # 新しく作る部分
  when 'group'
  # groupの人を見る部分
  when 'exist'
    # ユーザ名が存在するかを確認する部分
    $client = Mysql2::Client.new(host: "localhost", username: "task", password: "Pace_maker1", encoding: "utf8", database: "pace")
    res = $client.query("select * from pace.users where user_id = #{id}")
    h = Hash.new
    if(res.entries.empty?) then
      h.store("exist", false)
    else
      h.store("exist", true)
    end
    print h
  else
    # ちゃんと作ってたら、ここには来ないはず
    puts "そんなのないよ"
  end
end

def add(id, pos, data)
  nil
end


def view(id, pos=0)
  print make_tree(id).search(pos).to_json
end
