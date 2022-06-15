import './style/main.css';
import Web3 from "web3";
import { useEffect,useState } from 'react';
 
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

import GuitarIMG from "./assets/img/16.png"
import { ABI, apikey, ADDRESS,endpoint,nftpng,infuraId } from './config';
import cogoToast from 'cogo-toast';


let account = null;
let contract = null;
  
const providerOptions ={
	 binancechainwallet:{
		 package:true
	 },
	 walletconnect: {
		package: WalletConnectProvider, // required
		options: {
		  infuraId:infuraId // required
		}
	  },
	  coinbasewallet: {
		package: CoinbaseWalletSDK, // Required
		options: {
		  appName: "Guitar NFT collection", // Required
		  infuraId: infuraId, // Required
		  rpc: "", // Optional if `infuraId` is provided; otherwise it's required
		  chainId: 4, // rinkerby
		  darkMode: true // Optional. Use dark theme, defaults to false
		}
	  }
}
  

const web3Modal = new Web3Modal({
	network: "rinkeby", // optional
	theme:"dark",
	cacheProvider: true, // optional
	providerOptions // required
  });

  
const App = () => {

  const [balance, setBalance] = useState(0);
  const [nftlist, setNFTList] = useState([]);
  const [walletAddress, setWalletAddress] = useState();
  	

const   connectWallet = async () =>{
	
	try {	
	     
		let provider = await web3Modal.connect();
  
		 let web3 = new Web3(provider);
		 await window.ethereum.send('eth_requestAccounts');
		 var accounts = await web3.eth.getAccounts();
		 account = accounts [0];
		 setWalletAddress(account);

		 document.getElementById("wallet-address").textContent = account;
		 contract = new web3.eth.Contract(ABI, ADDRESS);
 
		  
	 
	 } 
   catch(ex)
   {
	 console.log(ex);
   }
 
 }
 


 const mint = async () => {
	let _mintAmount = Number(document.querySelector("[name=amount]").value);

    if (window.ethereum){

      if(_mintAmount > 3){
		cogoToast.error('Maximum Minting Allowed is 3');

	 }else{
		 
		var mintRate = Number(await contract.methods.cost().call());
		var totalAmount = mintRate * _mintAmount;
	
		contract.methods.mint(account, _mintAmount).send({
		  from:account,
		  value: String(totalAmount)
		});
	 }
 

      }
}
 

  const  getBalance = ()=>{
    let requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    fetch(endpoint+"?module=stats&action=tokensupply&contractaddress="+ADDRESS+"&apikey="+apikey+"", requestOptions)
      .then(response => response.text())
      .then(result => {
        let p = JSON.parse(result);
        setBalance(p.result)
      })
      .catch(error => console.log('error', error));
  }
 
 
  
  const  getNFTList = ()=>
  {

	if(walletAddress)
	{
    let requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
	
    fetch(endpoint+"?module=account&action=tokennfttx&address="+walletAddress+"&contractaddress="+ADDRESS+"&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey="+apikey+"", requestOptions)
      .then(response => response.text())
      .then(result => {
        let p = JSON.parse(result);
          setNFTList(p.result);
      })
      .catch(error => {

		  console.log('error', error)
		  
	   } );
	}
  }


   useEffect(()=>{
    getBalance();
   },[]);


   useEffect(()=>{
	getNFTList();
   },[walletAddress]);


    
  return (
    <div className="App">
 
	   <img src={GuitarIMG}/>

       <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
         <div className="text-center lg:w-2/3 w-full">
 
		  <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium  ArchivoBold text-white">Guitar NFT Minting Portal</h1>
          <p className="mb-8 leading-relaxed ArchivoBold text-white">Please connect your wallet to mint the Guitar NFT Collection</p>
          <div className="flex justify-center">
           
		   {
			   	!walletAddress  &&
				   <button 
				   onClick={()=>{connectWallet()}}
				   className="inline-flex text-white connect-wallet-icon DMSansBold border-0 py-2 px-6 focus:outline-none  rounded text-2xl">Connect Wallet</button>
				 
		   }
		      </div>

		 
			<p id="wallet-address" className="mb-8  mt-8 leading-relaxedx DMSansBold text-blue">XXXX</p>
             
           <input 

           defaultValue={1}
           min={1}
           max={5}
           type="number" 
           id="amount" 
           name="amount" 
           className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
           <label className="text-white DMSansBold">Please select the Amount of NFT to Mint</label>
            </div>

			{
				walletAddress && walletAddress.length > 6 &&
				<button 
				onClick={()=>{mint()}}
				 className="inline-flexx w-1/6 mt-10 text-white bg-pink-500 border-0 py-2 px-6 focus:outline-none hover:bg-pink-600 rounded text-lg DMSansBold">Mint/Buy</button>
				 
			}
            
			
			<label className="text-black DMSansBold">Price 0.05 ETH each mint</label>

          </div>
 
        </section>

        <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-wrap -m-4 text-center">
			      <div className="p-4 sm:w-1/4 w-1/2">
              <h2 className="title-font font-medium sm:text-4xl text-3xl text-gray-900">0</h2>
              <p className="leading-relaxed"></p>
            </div>
            <div className="p-4 sm:w-1/4 w-1/2">
              <h2 className="title-font font-medium sm:text-4xl text-3xl ArchivoBlack text-white">{balance}/20</h2>
              <p className="leading-relaxed ArchivoBlack text-white">Total Minted</p>
            </div>
            <div className="p-4 sm:w-1/4 w-1/2">
              <h2 className="title-font font-medium sm:text-4xl text-3xl ArchivoBlack text-white">{20}</h2>
              <p className="leading-relaxed ArchivoBlack text-white">Total Supply</p>
            </div>
         
            <div className="p-4 sm:w-1/4 w-1/2">
              <h2 className="title-font font-medium sm:text-4xl text-3xl text-gray-900">0</h2>
              <p className="leading-relaxed">...</p>
            </div>
          </div>
        </div>
      </section>


	  <section className="text-gray-600 body-font">
 
 
	<div className="container px-5 py-24 mx-auto">
	<h2 className="tracking-widest text-5xl mb-10 title-font font-medium text-black-400 mb-1">Your Collectibles</h2>

    <div className="flex flex-wrap -m-4">
     
 
	 {
		 nftlist && nftlist.map( (item, index)=>{
			 return(
				<div className="p-4 md:w-1/6" key={index}>
				<div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
				  <img className="lg:h-48 md:h-36 w-fullx object-coverx object-centerx" src={`${nftpng}/${item.tokenID}.png`} alt="blog" />
				  <div className="p-6">
					<h2 className="tracking-widest text-xs title-font font-medium text-black-400 mb-1">{item.tokenName} #{item.tokenID} </h2>
  				 
				  </div>
				</div>
			  </div>
			 )
		 })
   

	 }
   
    </div>
  </div>
</section>

    </div>
  );
}

export default App;
