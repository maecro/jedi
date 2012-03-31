module HomeHelper
  def friends_pictures
    @friends.each do |friend|
      @graph.get_picture(friend[:id])
    end
  end
end
