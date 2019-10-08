defmodule Builds.Repo do
  use Ecto.Repo,
    otp_app: :builds,
    adapter: Ecto.Adapters.Postgres
end
