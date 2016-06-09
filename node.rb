# coding: utf-8
require 'json'
require 'mysql2'

class Node
  attr_accessor :node_id, :parent, :deadline, :status, :task_name, :child
  
  def initialize(hash={:task_id => 0, :task_name => 'root'}, parent = nil)
    @node_id = hash[:task_id]
    @parent = parent
    @task_name = hash[:task_name]
    @status = hash[:status]
    @deadline = hash[:deadline]
    @child = []
  end

  def add_child(hash)
    @child.push(Node.new(hash,self))
  end

  def delete
    # ノードの削除
    $client.query("delete from pace.tasks where task_id = #{@node_id}")
    @parent = nil
    @child = nil
  end

  def route
    # 注目しているノードまでのルートを作る
    path = []
    n = self
    while n = n.parent
      path.push(n.task_name)
    end
    return path.reverse
  end

  def root
    # rootを返すメソッド
    tmp = self
    while tmp
      tmp = @parent
    end
    return tmp
  end

  def search(id)
    # ノードの検索
    if @node_id == id then
      return self
    else
      @child.each do |n|
        node = n.search(id)
        if node then
          return node
        end
      end
    end
    return nil
  end

  def to_hash
    # json化するためのメソッド
    {:task_name => @task_name, :status => @status, :deadline => @deadline, :node_id => @node_id, :parent_id => @parent.node_id}
  end

  def to_json
    # 自分より下をJSON化する
    str = ""
    @child.each do |n|
      str += '{"node":' + JSON.generate(n.to_hash) + ','
      str += '"child":' + n.to_json + '},'
    end
    return '[' + str.chop + ']'
  end

  def print_child
    # デバッグ用
    print @task_name + " parent: "
    puts (@parent.nil?) ? 'nil' : @parent.task_name
    @child.each do |n|
      n.print_child
    end
  end
  
  # 自分の進捗を更新し、親のも更新する
  def progres_status
    if @status.between?(0,1) then
      @status += 1
    else
      @status = 0
    end
    $client.query("update pace.tasks set status = #{@status} where task_id = #{@node_id}");
    parent_progress
  end

  # statusの更新を親へ波及させる
  def parent_progress
    p = @parent
    while true
      sum = p.child.inject(0){|sum, node| sum += node.status}
      case sum
      when 0
        p.status = 0
      when p.child.length * 2
        p.status = 2
      else
        p.status = 1
      end
      $client.query("update pace.tasks set status = #{p.status} where task_id = #{p.node_id}");
      p = p.parent
      break unless p.parent
    end
  end
end

def make_tree(user_id)
  # 木構造を作る
  $client = Mysql2::Client.new(host: "localhost", username: "task", password: "Pace_maker1", encoding: "utf8", database: "pace")

  # ユーザのタスク一覧を取得
  result = $client.query("select * from pace.tasks where user_id = #{user_id}")
  root = Node.new
  result.each do |list|
    list = symbolize_keys(list)
    parent = root.search(list[:parent_id])
    if parent then
      parent.add_child(list)
    else
      root.add_child(list)
    end
  end
  return root
end

# hashのキーをシンボル化
def symbolize_keys(hash)
  hash.inject({}){|h, (k,v)| h[k.to_sym] = v;h }
end
