use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :builds, BuildsWeb.Endpoint,
  http: [port: 4184],
  server: true

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :builds, Builds.Repo,
  username: "postgres",
  password: "postgres",
  database: "builds_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox
