defmodule BuildsWeb.PageControllerTest do
  use BuildsWeb.ConnCase
  use Hound.Helpers

  hound_session()

  @tag :browser
  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "Welcome to Phoenix!"
  end

  @tag :browser
  test "the page title" do
    navigate_to("/")
    assert page_title() == "Builds · Phoenix Framework"
  end
end
