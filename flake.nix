{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    systems.url = "github:nix-systems/default";
  };

  outputs = { self, nixpkgs, systems, ... } @ inputs:
    # let
    #   forEachSystem = nixpkgs.lib.genAttrs (import systems);
    # in
    # forEachSystem (system:
      let
        system = "aarch64-darwin"; 
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages.${system} = {
          bobaServer = pkgs.buildNpmPackage {
            name="boba-server";
            version="0.0.1";
            npmDepsHash = "sha256-ImoD8FMByVtcCc/FCeiP+hTwrV2aSga32FINlt0gQLA=";
            npmFlags = [ "--legacy-peer-deps" ];
            src = ./.;
            installPhase = ''
              cp -r dist $out
              cp package-lock.json $out
            '';
          };
        };
        defaultPackage.${system} =  self.packages.${system}.bobaServer;
      };
      # );
}