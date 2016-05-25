require './node'

client = Mysql2::Client.new(host: "localhost", username: "task", password: "Pace_maker1", encoding: "utf8", database: "pace")

result = client.query('select * from pace.tasks where user_id = 1013179')

p result.entries

result.each do |list|
  p list
end
