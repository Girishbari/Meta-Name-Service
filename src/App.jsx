

import React, { useEffect, useState } from 'react';
// import {Biconomy} from "@biconomy/mexa";
import './styles/App.css';
import { ethers } from 'ethers';
import contractAbi from './utils/contractABI.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import LoadingIndicator from './components/LoadingIndicator';
import { useMoralis, useWeb3Transfer } from 'react-moralis';
import { Button ,Form, FormGroup, FormControl, Spinner } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { Framework } from '@superfluid-finance/sdk-core';
import RentUserDomain from './components/RentUserDomain';
import UserOwnDomain from './components/UserOwnDomain';
import { CONTRACT_ADDRESS } from './constant'
import ListRentable from './components/ListRentable';
import detectEthereumProvider from '@metamask/detect-provider';







const App = () => {
	const provider = new ethers.providers.Web3Provider(ethereum);
	const tld = '.meta';
	//const CONTRACT_ADDRESS = '0x4a6CE1c8c5b905c556663B466E2E61Fd00A9a3Af';


	const [currentAccount, setCurrentAccount] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [network, setNetwork] = useState('');
	const [showToast, setShowToast] = useState(false);
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [mints, setMints] = useState([]);
	const [rentButton, setRentButton] = useState(false);
	const [NFTdata, setNFTData] = useState();
	const [polygonNFTs, setPolygonNFTs] = useState('');
	const [RentCompButton, setRentCompButton] = useState(false);
	const [UserDomainButton, setUserDomainButton] = useState(false);
	const [RentNFTData, setRentNFTData] = useState({});
	const [RentNFTDataID, setRentNFTDataID] = useState({});
    const [RentNFTDOwner, setRentNFTOwner] = useState("");
    const [ ListRentableButton, setListRentableButton] = useState(false);
    
 
    // const biconomy = new Biconomy(provider, {
    //   apiKey: "6nzy1LAUf.eee5bb89-9c8e-43f2-9bb5-81fd77ab2b17",
    //   debug: true,
    // });
    // const web3 = new Web3(biconomy);

    

     
    

	const connectWallet = async () => {
		try {
			if (!ethereum) {
				alert('Consider installing Metemask');
			}
			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});
			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
        
	};

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;
		if (!ethereum) {
			console.log('Consider install Metemask');
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// Users can have multiple authorized accounts, we grab the first one if its there!
		if (accounts.length !== 0) {
			const account = accounts[0];
			setCurrentAccount(account);
			console.log('Found an authorized account:', account);
			console.log('Connected', accounts[0]);
			//window.location.reload();
		} else {
			console.log('No authorized account found');
		}

		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);

		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}

	};

	const mintDomain = async () => {
		// Don't run if the domain is empty
		if (!domain) {
			return;
		}
		// Alert the user if the domain is too short
		if (domain.length < 3) {
			alert('Domain must be at least 3 characters long');
			return;
		}
		// Calculate price based on length of domain (change this to match your contract)
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price =
			domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
		console.log('Minting domain', domain, 'with price', price);
		try {
			const { ethereum } = window;
			if (ethereum) {
				setIsLoading(true);
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractAbi.abi,
					signer
				);

				console.log('Going to pop wallet now to pay gas...');
				let tx = await contract.register(domain, {
					value: ethers.utils.parseEther(price)
				});
				// Wait for the transaction to be mined
				const receipt = await tx.wait();

				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log(
						'Domain minted! https://mumbai.polygonscan.com/tx/' + tx.hash
					);

					// Set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();

					alert('Record set! https://mumbai.polygonscan.com/tx/' + tx.hash);

					setRecord('');
					setDomain('');
					setIsLoading(false);
				} else {
					alert('Transaction failed! Please try again');
					setIsLoading(false);
				}
			}
		} catch (error) {
			setIsLoading(false);
			alert('Something went wrong');
		}
	};

	const fetchMints = async () => {
		try {
           
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				CONTRACT_ADDRESS,
				contractAbi.abi,
				signer
			);
            

			// Get all the domain names from our contract
			const names = await contract.getAllNames();
			const mintRecords = await Promise.all(
				names.map(async (name, address) => {
					const mintRecord = await contract.records(name);
					const owner = await contract.domains(name);
					return {
						id: names.indexOf(name),
						name: name,
						record: mintRecord,
						owner: owner
					};
				})
			);
			console.log('MINTS FETCHED ', mintRecords);
			setMints(mintRecords);
		} catch (error) {
			console.log(error);
		}
	};

	const updateDomain = async () => {
		if (!record || !domain) {
			return;
		}
		setLoading(true);
		console.log('Updating domain', domain, 'with record', record);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractAbi.abi,
					signer
				);

				let tx = await contract.setRecord(domain, record);
				await tx.wait();
				console.log('Record set https://mumbai.polygonscan.com/tx/' + tx.hash);

				fetchMints();
				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	};

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }] // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
										name: 'Mumbai Matic',
										symbol: 'MATIC',
										decimals: 18
									},
									blockExplorerUrls: ['https://mumbai.polygonscan.com/']
								}
							]
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert(
				'MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html'
			);
		}
	};

	const { Moralis } = useMoralis();
	const rentDomain = async Token => {
		setRentButton(true);
		console.log(Token);
		let _id = Token.id;

		const options = {
			address: CONTRACT_ADDRESS.toString(),
			token_id: _id.toString(),
			chain: 'mumbai'
		};
		const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(
			options
		);
		setPolygonNFTs(tokenIdMetadata);
		console.log(polygonNFTs);
	};

	useEffect(
		() => {
			if (network === 'Polygon Mumbai Testnet') {
				fetchMints();
			}
			checkIfWalletIsConnected();
		},
		[currentAccount, network]
	);

	const renderNotConnectedContainer = () => {
		return (
			<div className="connect-wallet-container">
				<button
					className="cta-button connect-wallet-button"
					onClick={connectWallet}
				>
					Connect Wallet To Get Started
				</button>
			</div>
		);
	};

	const renderInputForm = () => {
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<h2>Please connect to the Polygon Mumbai Testnet</h2>
					<button className="cta-button mint-button" onClick={switchNetwork}>
						Click here to switch
					</button>
				</div>
			);
		}

		return (
			<div className="form-container">
                <div className="first-row">
                 <button className="styled-button" onClick={() => UserProfile()}>Your Domain </button>
                  <button className="styled-button" onClick={() => Listrentable()}> Explore </button>    
                </div>
                 
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder="domain"
						onChange={e => setDomain(e.target.value)}
					/>
					<p className="tld"> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder="whats your META power"
					onChange={e => setRecord(e.target.value)}
				/>

				{editing ? (
					<div className="button-container">
		
					</div>
				) : (
					<>
						<button
							className="cta-button mint-button"
							disabled={loading}
							onClick={mintDomain}
						>
							Mint
						</button>
						
					</>
				)}
			</div>
		);
	};

	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
			return (
                <div>
				<div className="mint-container">
					<p className="subtitle"> Recently minted domains!</p>
					<div className="mint-list">
						{mints.map((mint, index) => {
							return (
								<div className="mint-item" key={index}>
									<div className="mint-row">
										<a
											className="link"
											href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${
												mint.id
											}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<p className="underlined">
												{' '}
												{mint.name}
												{tld} {mint.id}
											</p>
										</a>
								
									</div>
									<p> {mint.record} </p>
                                    	{/* If mint.owner is currentAccount, add an "edit" button*/}
										{mint.owner.toLowerCase() ===
										currentAccount.toLowerCase() ? (
											<button
												className="rentCompbutton"
												onClick={() => rentDomain(mint)}
											> Lend  
												<img
													className="edit-icon"
													src="https://img.icons8.com/metro/26/000000/rent.png"
													alt="Rent button"
												/>
											</button>
										) : (
										null
										)}
								</div>
							);
						})}
					</div>
				</div>
                    </div>
			);
		}
	};

	const RenderRents = () => {
		if (polygonNFTs?.metadata) {
			const temp = JSON.parse(polygonNFTs.metadata);
			const RentNFTID = JSON.parse(polygonNFTs.token_id)
            const RentNFT_owner = polygonNFTs.owner_of
            setRentNFTDataID(RentNFTID);
            setRentNFTOwner(RentNFT_owner);
			return (
				<div className="mint-item" align="center">
					<Card style={{ width: '18rem' }}>
						<Card.Img variant="top" src={temp.image} />
						<Card.Body>
							<Card.Title>
								{temp.name}
                                {/*	{polygonNFTs.token_id } */}
							</Card.Title>

							<Button
								className="cta-button mint-button"
								onClick={() => RentComp(temp, polygonNFTs.token_id)}
							>
								Lend Domain
							</Button>
						</Card.Body>
					</Card>
				</div>
			);
		}

		return <div />;

	};

	const RentComp = (temp, id) => {
		setRentCompButton(true);
		console.log(temp);
		console.log(id);
		setRentNFTData(temp);
		console.log(RentNFTData);
	};

	const UserProfile = () => {
		setUserDomainButton(true);
	};
    const Listrentable = () =>{
        setListRentableButton(true);
    }
	// This will take us into edit mode and show us the edit buttons!
	const editRecord = name => {
		console.log('Editing record for', name);
		setEditing(true);
		setDomain(name);
	};

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="center">
                            
							<p className="title">🐱‍👤 Meta Name Service</p>
							<p className="subtitle">From Zuck Company Metaverse</p>
						</div>
                       
						<div className="right">
							<img
								alt="Network logo"
								className="logo"
								src={network.includes('Polygon') ? polygonLogo : ethLogo}
							/>
							{currentAccount ? (
								<p>
									{' '}
									Wallet: {currentAccount.slice(0, 6)}...
									{currentAccount.slice(-4)}{' '}
								</p>
							) : (
								<p> Not connected </p>
							)}
						</div>
                    	

					</header>
				</div>
                <div >
                    <div  >
                
                    </div>
                    
					{!currentAccount && renderNotConnectedContainer()}
                      {ListRentableButton  && (
                                      <ListRentable />
                                    )}
                    {!ListRentableButton && (
                       <>
                           
                       </>
                    )}
					{currentAccount && (
						<>
							{RentCompButton && (
								<RentUserDomain
									temp={RentNFTData}
									id={RentNFTDataID}
									account={currentAccount}
                                    RentNFTowner = {RentNFTDOwner}
                                   
								/>
							)}
							{!RentCompButton && (
								<>
									{UserDomainButton && (
										<UserOwnDomain account={currentAccount} />
									)}
                                  

									{renderInputForm()}
									{mints && renderMints()}
									{rentButton && <RenderRents />}
								</>
							)}
						</>
					)}

				</div>
			</div>
		</div>
	);
};

export default App;
