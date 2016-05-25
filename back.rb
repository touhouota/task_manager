#!/usr/bin/ruby
# coding: utf-8
require 'cgi'
require './controller'

begin
  cgi = CGI.new

  print "Content-Type: text/plain\n\n"

  params = cgi.params
  create_contents(params)
end
