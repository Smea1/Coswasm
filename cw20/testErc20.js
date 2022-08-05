// import { SigningCosmWasmClient, Secp256k1HdWallet } from "cosmwasm";
var stargate = require("@cosmjs/stargate");

var fs = require("fs");
var wasm = require("cosmwasm");
var crypto = require("@cosmjs/crypto");


const rpcEndpoint = "localhost:26657"

//private key
const mnemonic = "palace cube bitter light woman side pave cereal donor bronze twice work";
const mnemonic2= "puzzle glide follow cruel say burst deliver wild tragic galaxy lumber offer";

async function main() {
    // Create a wallet
    const path = crypto.stringToPath("m/44'/118'/0'/0/0");
    const wallet = await wasm.Secp256k1HdWallet.fromMnemonic(mnemonic, {hdPaths:[path], "prefix":"ex"});
    const wallet2 = await wasm.Secp256k1HdWallet.fromMnemonic(mnemonic, {hdPaths:[path], "prefix":"ex"});

  
    // Using
    const client = await wasm.SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
    );

    const client2 = await wasm.SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet2,
    );
    
    //get sender
    var accs = await wallet.getAccounts()
    var sender = accs[0].address

    var bobWallet = await wallet2.getAccounts()
    var bob = bobWallet[0].address

    var receiver = "ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27"
    console.log("sender is: ", sender)
    console.log("bob is: ", bob)
    console.log("receiver is: ", receiver)

    //get contract code
    var data = fs.readFileSync('./cw_erc20.wasm');

    //get balance
    var balance = await client.getBalance(sender,"okt")
    console.log(balance);

    //var balance = await client.getBalance("ex1h0j8x0v9hs4eq6ppgamemfyu4vuvp2sl0q9p3v","okt")
    //upload contract
    var contractCode = await client.upload(sender, data, {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"})
    console.log(contractCode)
    var initBalance = [{"address":"ex1eutyuqqase3eyvwe92caw8dcx5ly8s544q3hmq","amount":"100000000000000000000"}]
    //init contract
    var initMsg = {"name":"USDT","symbol":"USDT","decimals":9,"initial_balances":initBalance};
    var res2 = await client.instantiate(sender, contractCode.codeId, initMsg, "init usdt token", {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},{"funds":[{"denom":"okt","amount":"100"}],"admin":sender})
    console.log(res2)
    
    var approveMsg = {"approve":{"spender":bob,"amount":"100"}};
    var res3 = await client.execute(sender, res2.contractAddress, approveMsg,  {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},'')
    console.log(res3)

    var transMsg = {"transfer":{"recipient":receiver,"amount":"100"}};
    var res4 = await client.execute(sender, res2.contractAddress, transMsg,  {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},'')
    console.log(res4)

    var transFromMsg = {"transfer_from":{"owner":sender,"recipient":receiver,"amount":"100"}};
    var res5 = await client2.execute(sender, res2.contractAddress, transFromMsg,  {"amount":wasm.parseCoins("200000000000000000wei"),"gas":"20000000"},'')
    console.log(res5)

    
    var res6= await client.queryContractSmart(res2.contractAddress,{"balance":{"address":sender}})
    var res7= await client.queryContractSmart(res2.contractAddress,{"balance":{"address":receiver}})
    console.log(res6,res7)

    console.log("end")
  }
  
  
  main() 
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
