# Fund Management Backend

This project serves as the backend system for a fund management application. It handles all data processing, storage, and API services required to manage investment funds effectively. The system is built with robustness and scalability in mind, providing a solid foundation for financial operations.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Docker installed
- Node.js installed (specify version if necessary)
- PostgreSQL installed or accessible via Docker
- Anvil installed for blockchain simulation (optional for development)

## Setup

### Running PostgreSQL with Docker

To run a PostgreSQL database locally using Docker, follow these steps:

1. Pull the PostgreSQL image:
   ```bash
   docker pull postgres
   ```
2. Run the PostgreSQL container:
   ```bash
   docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
   ```
3. Run migrations for drizzle:
   ```bash
   npm run db:push
   ```

### Running the Nest.js Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Nest.js application:
   ```bash
   npm start
   ```

### Running Anvil for Blockchain Simulation

Anvil is a local Ethereum node designed for development. To run Anvil:

1. Install Anvil if not already installed:
   ```bash
   npm install -g @foundry-rs/anvil
   ```
2. Start Anvil:
   ```bash
   anvil
   ```

### Deploying Solidity Contracts to Anvil

To deploy Solidity contracts using Foundry to the Anvil Ethereum node:

1. Ensure Foundry is installed:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
2. Compile your Solidity contracts with Foundry:
   ```bash
   forge build
   ```
3. Deploy the compiled contracts to Anvil:
   ```bash
   forge create --rpc-url http://localhost:8545 src/blockchain/FundToken.sol:FundToken
   ```


## Project Architecture Overview And Design Decisions

### How It Works

1. **User Interaction**
   - Users call `/investments` or `/redemptions` endpoints
   - Provide their address and amount

2. **System Processing**
   - Backend executes blockchain transactions using system wallet
   - Records transaction in database with 'pending' status
   - Returns transaction hash to user

3. **Transaction Monitoring**
   - Background service monitors pending transactions
   - Updates database when transactions have 6 confirmations
   - Handles both investments and redemptions

### Tech Stack
- **NestJS Framework**: Chosen for its robust structure and extensibility, NestJS helps in organizing the codebase with clear modularity and uses decorators for clean code.

- **Blockchain Service**: This service handles all blockchain interactions. It communicates with Ethereum-based smart contracts for transaction processing and other on-chain activities.

- **PostgreSQL Database**: All transaction data received from the blockchain is persisted in a PostgreSQL database

- **Transaction Listener**: A dedicated listener monitors the blockchain for confirmations of transactions. It ensures that each transaction is confirmed at least 6 times to guarantee its finality before updating the db state.

- **NestJS Annotations**: We use NestJS's custom decorators to efficiently manage and track fund metrics cache

- **Foundry**: We use Foundry to compile and deploy the smart contracts to the local anvil node.



### Future Improvements Needed
- Will need a way to recover the db in case it goes out of sync with the blockchain
- Need to handle chain reorgs
- Allow sure to execute tx with own wallet instead of system wallet
- Add an auth system
- Need to have extra accountancy checks to make sure the system is working as expected