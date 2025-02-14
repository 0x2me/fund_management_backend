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


## Project Architecture Overview

The backend is structured using NestJS, a progressive Node.js framework, for building efficient and scalable server-side applications. Here are the key components of our architecture:

- **NestJS Framework**: Chosen for its robust structure and extensibility, NestJS helps in organizing the codebase with clear modularity and is equipped with powerful decorators for enhancing functionality.

- **Blockchain Service**: This service handles all blockchain interactions. It communicates with Ethereum-based smart contracts for transaction processing and other on-chain activities.

- **PostgreSQL Database**: All transaction data received from the blockchain is persisted in a PostgreSQL database, ensuring data integrity and providing a reliable storage solution.

- **Transaction Listener**: A dedicated listener monitors the blockchain for confirmations of transactions. It ensures that each transaction is confirmed at least 6 times to guarantee its finality before updating the system state.

- **NestJS Annotations**: We utilize NestJS's custom decorators to efficiently manage and track fund metrics, simplifying the process of data aggregation and manipulation.


