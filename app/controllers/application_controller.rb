class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :parse_facebook_cookies

  def parse_facebook_cookies
  #@oauth = Koala::Facebook::OAuth.new('293391064067105', '951f9e676db8fab0e3eebd5d8b6021fa')
  #@facebook_cookies ||= @oauth.get_user_info_from_cookies(cookies)
  @facebook_cookies ||= Koala::Facebook::OAuth.new.get_user_info_from_cookie(cookies)

  # If you've setup a configuration file as shown above then you can just do
  # @facebook_cookies ||= Koala::Facebook::OAuth.new.get_user_info_from_cookie(cookies)
  end

end
