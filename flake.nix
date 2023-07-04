{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    systems.url = "github:nix-systems/default";
  };

  outputs = { self, nixpkgs, systems, ... } @ inputs:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in {
      packages = forEachSystem (system:
        let
            pkgs = nixpkgs.legacyPackages.${system};
        in rec {
          bobaserver-assets = pkgs.yarn2nix-moretea.mkYarnPackage {
            name="boba-server";
            version="0.0.1";
            src = ./.;
            dontFixup = true;
            doDist = false;
            buildPhase = ''
              yarn build
            '';
            distPhase = "";
            installPhase = ''
              mkdir -p $out/libexec/bobaserver
              mv node_modules $out/libexec/bobaserver/
              mv deps $out/libexec/bobaserver/
            '';
          };

          bobadatabase = pkgs.writeShellScriptBin "bobadatabase" ''
            mkdir -p $out/docker-entrypoint-initdb.d/
            cp db/* docker-entrypoint-initdb.d/

            /bin/sh -c "${bobaserver-assets}/libexec/bobaserver/deps/bobaserver/db/init.sh"
          '';

          bobaserver = pkgs.writeShellScriptBin "bobaserver" ''
            export NODE_PATH=${bobaserver-assets}/libexec/bobaserver/node_modules
            export DEBUG=bobaserver:*,-*info

            exec ${pkgs.nodejs}/bin/node -r dotenv/config ${bobaserver-assets}/libexec/bobaserver/node_modules/bobaserver/dist/server/index.js
          '';
          default = bobaserver;
        }
      );
      defaultPackage = forEachSystem (system: self.packages.${system}.default);
    };
}