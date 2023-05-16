{ pkgs, ... }:

{
  # https://devenv.sh/basics/
  # env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = [ 
    pkgs.git
    pkgs.yarn
    pkgs.docker
  ];

  # https://devenv.sh/scripts/
  scripts.hello.exec = "echo hello from $GREET";
  scripts.dev.exec = "yarn run start-db && yarn run dev:watch";

  enterShell = ''
    yarn install
  '';


  # https://devenv.sh/languages/
  languages.javascript.enable = true;
  languages.javascript.package = pkgs.nodejs-16_x;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  processes.server.exec = "yarn run start-db & yarn run dev:watch";
  # See full reference at https://devenv.sh/reference/options/
}
