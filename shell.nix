{pkgs ? import <nixpkgs> {}}:

pkgs.stdenv.mkDerivation {
  name = "genAssembly";
  buildInputs = [pkgs.nodejs];
}
