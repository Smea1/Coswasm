// import { SigningCosmWasmClient, Secp256k1HdWallet } from "cosmwasm";
var stargate = require("@cosmjs/stargate");

var fs = require("fs");
var wasm = require("cosmwasm");
var crypto = require("@cosmjs/crypto");


const rpcEndpoint = "localhost:26657"

//private key
const mnemonic = "palace cube bitter light woman side pave cereal donor bronze twice work";

async function main() {
    // Create a wallet
    const path = crypto.stringToPath("m/44'/118'/0'/0/0");
    const wallet = await wasm.Secp256k1HdWallet.fromMnemonic(mnemonic, {hdPaths:[path], "prefix":"ex"});
  
    // Using
    const client = await wasm.SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
    );
    
    //get sender
    var accs = await wallet.getAccounts()
    
    var sender = accs[0].address
    var receiver = "ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27"
    console.log("sender is: ", sender)
    console.log("receiver is: ", receiver)

    //get contract code
    var data = fs.readFileSync('./cw_nameservice.wasm');

    //get balance
    var balance = await client.getBalance(sender,"okt")
    console.log(balance);

    //var balance = await client.getBalance("ex1h0j8x0v9hs4eq6ppgamemfyu4vuvp2sl0q9p3v","okt")
    //upload contract
    var contractCode = await client.upload(sender, data, {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"})
    console.log(contractCode)

    //init contract
    var initMsg = {"purchase_price":{"amount":"200","denom":"okt"},"transfer_price":{"amount":"100","denom":"okt"}};
    var res2 = await client.instantiate(sender, contractCode.codeId, initMsg, "hello world", {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},{"funds":[{"denom":"okt","amount":"100"}],"admin":sender})
    console.log(res2)
    
    var registerMsg = {"register":{"name":"sameal"}};
    var res3 = await client.execute(sender, res2.contractAddress, registerMsg,  {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},'',[stargate.coin(200, "okt")])
    console.log(res3)

    var transMsg = {"transfer":{"name":"sameal","to":receiver}};
    var res4 = await client.execute(sender, res2.contractAddress, transMsg,  {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},'',[stargate.coin(100, "okt")])
    console.log(res4)


    console.log("end")
  }
  
  
  main() 
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
