{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... } @ inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
          pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages = rec {
          bobaserver-assets = pkgs.yarn2nix-moretea.mkYarnPackage {
            name="boba-server";
            version="0.0.1";
            src = ./.;
            dontFixup = true;
            doDist = false;
            buildPhase = ''
              yarn build
            '';
            installPhase = ''
              mkdir -p $out/libexec/bobaserver
              mv node_modules $out/libexec/bobaserver/
              mv deps $out/libexec/bobaserver/
            '';
          };

          bobadatabase = {
            init = pkgs.writeShellApplication {
                name = "bobadatabase-init";
                runtimeInputs = [ pkgs.postgresql_12 ];

                text = ''
                  ${bobaserver-assets}/libexec/bobaserver/deps/bobaserver/db/00-init_tables.sh ${bobaserver-assets}/libexec/bobaserver/deps/bobaserver/db/
                '';
              };
            seed = pkgs.writeShellApplication {
                name = "bobadatabase-seed";
                runtimeInputs = [ pkgs.postgresql_12 ];

                text = ''
                  ${bobaserver-assets}/libexec/bobaserver/deps/bobaserver/db/10-init_tables.sh ${bobaserver-assets}/libexec/bobaserver/deps/bobaserver/db/
                '';
              };
          };

          # TODO: swap with wrapProgram 
          bobaserver = pkgs.writeShellScriptBin "bobaserver" ''
            export NODE_PATH=${bobaserver-assets}/libexec/bobaserver/node_modules
            export DEBUG=bobaserver:*,-*info
            export NODE_ENV=production

            exec ${pkgs.nodejs}/bin/node -r dotenv/config ${bobaserver-assets}/libexec/bobaserver/node_modules/bobaserver/dist/server/index.js
          '';
          default = bobaserver;
        };
      }
    );
}