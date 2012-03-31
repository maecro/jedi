class HomeController < ApplicationController

  def index
    unless @facebook_cookies == nil then
      #@access_token = @facebook_cookies["access_token"]
      #@graph = Koala::Facebook::GraphAPI.new(@access_token)
      #@friends = @graph.get_connections("me", "friends")
    end
  end

end
