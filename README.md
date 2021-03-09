# wallet-login
A Go API for verifying signatures. Supports smart contract wallets which implement [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271)

To test api
```sh
cd api
go test ./...
```
To run api server
```sh
go build -o service ./cmd
./service
```
To test and run React frontend, in a new terminal window:
```sh
cd client
npm install
npm test
npm start
```
App will be available at http://localhost:3000

