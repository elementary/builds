defmodule BuildsWeb.PageController do
  use BuildsWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
