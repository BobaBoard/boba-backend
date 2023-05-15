{ pkgs, ... }:

{
  # https://devenv.sh/basics/
  env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = [ 
    pkgs.git
    pkgs.yarn
    pkgs.docker
  ];

  # https://devenv.sh/scripts/
  scripts.hello.exec = "echo hello from $GREET";

  enterShell = ''
    hello
    git --version
    node -v
    yarn install
    export $(xargs < .env)
  
    echo $PORT
    echo $PGDATABASE

    source ./db/scripts/wait_for_connection.sh &
  '';


  # https://devenv.sh/languages/
  languages.javascript.enable = true;
  languages.javascript.package = pkgs.nodejs-16_x;

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_12;
    port = 35432;
    createDatabase = false;
    initialScript = "CREATE USER postgres SUPERUSER;";
  };

  services.redis.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
    processes.server.exec = "yarn run dev:watch";
  # processes.test.exec = ''sleep 5 && psql -U postgres -c \"DROP ROLE IF EXISTS $POSTGRES_USER; CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD $POSTGRES_PASSWORD;\"'';
   # processes.test.exec = ''
   # sleep 5 && psql -U postgres -c "DROP ROLE IF EXISTS ${builtins.getEnv "POSTGRES_USER"}; CREATE ROLE ${builtins.getEnv "POSTGRES_USER"} WITH LOGIN PASSWORD '${builtins.getEnv "POSTGRES_PASSWORD"}';"
   # '';
   # processes.test.exec = "";
  # processes.databaseInit = {
  #  exec = ''
  #    sleep 5
  #    echo $POSTGRES_PORT
# #     until psql -p $POSTGRES_PORT -U postgres -c '\q'; do
# #       echo "Postgres is unavailable - sleeping"
# #       sleep 1
# #     done
  #    echo "Postgres is up - executing command"
  #    # here you can run your own scripts/commands
  #  '';
  #};
  # See full reference at https://devenv.sh/reference/options/
}
