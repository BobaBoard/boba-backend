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
          bobaserver = pkgs.writeShellScriptBin "bobaserver" ''
            export NODE_PATH=${bobaserver-assets}/libexec/bobaserver/node_modules
            export GOOGLE_APPLICATION_CREDENTIALS_PATH=$(pwd)/firebase-sdk.json
            export DEBUG=bobaserver:*,-*info

            ${pkgs.nodejs}/bin/node -r dotenv/config ${bobaserver-assets}/libexec/bobaserver/node_modules/bobaserver/dist/server/index.js
          '';
          default = bobaserver;
        }
      );
      defaultPackage = forEachSystem (system: self.packages.${system}.default);
    };
}