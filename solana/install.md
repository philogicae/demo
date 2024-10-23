# Install dev environment

```bash
# Required packages
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    pkg-config \
    libudev-dev llvm libclang-dev \
    protobuf-compiler libssl-dev

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
rustc --version

# Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
solana --version

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest
echo 'export PATH="$HOME/.avm/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
avm use latest

# Updates
rustup update
agave-install update
avm update
```

# Configuration

```bash
solana config get # See current config
solana config set -um # Set to mainnet-beta
solana config set -ud # Set to devnet

solana-keygen new # Create new wallet
solana config set -ud && solana airdrop 2 # Get devnet faucet
solana address
solana balance
```

# Testing

```bash
solana config set -ul
mkdir -p ~/solana-validator
cd ~/solana-validator
solana-test-validator
```
