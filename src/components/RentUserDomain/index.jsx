import './RentUserDomain.css';
import React, { useEffect, useState } from 'react';
import { useMoralis, useWeb3Transfer } from 'react-moralis';
import { Staking_Contract } from './constant.jsx';
import NFT_staker from './contractABI.json';
import { CONTRACT_ADDRESS } from '../../constant';
import contractAbi from '../../utils/contractABI.json';
import { MATICABI } from "../../config";

import {
	Button,
	Form,
	FormGroup,
	FormControl,
	Spinner,
	Card,
    Row,
    Col
} from 'react-bootstrap';
import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';
import LoadingIndicator from '../../components/LoadingIndicator';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const RentUserDomain = props => {
	const currentAccount = props.account;
	const DepositNFT = props.id;
	const MainContract = props.mainContract;
	const recipient = props.RentNFTowner;
//	const [flowRate, setFlowRate] = useState('');
	const [isButtonLoading, setIsButtonLoading] = useState(false);
	const [flowRateDisplay, setFlowRateDisplay] = useState('');
	const [Deposited, setDeposited] = useState(false);
	const [stakedNFT, setStakedNFT] = useState([]);
	const { Moralis } = useMoralis();
	const [mainContract, setMainContract] = useState(null);
	const [approved, setApproved] = useState(false);
	const [staked, setStaked] = useState(false);
	const [Unstaked, setUnstaked] = useState(true);
	const [Loading, setLoading] = useState(false);
	const [AllRentable, setAllRentable] = useState([]);
	const [UserOwn, setUserOwn] = useState([]);
	const [RentedButton, setRentedButton] = useState(false);
	const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    const [counter, setCounter] = useState(1);
    const [Rentcounter, setRentcounter] = useState(0);
    const [amount, setAmount] = useState("");


	useEffect(() => {
		MainContractConnection();
		ShowAllRentable();
		Check_Deposit();
	}, []);


    const MainContractConnection = async () => {
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const mainContract = new ethers.Contract(
				CONTRACT_ADDRESS,
				contractAbi.abi,
				signer
			);

			setMainContract(mainContract);
			console.log('Hey I am main contract', mainContract);
		} catch (error) {
			console.log(error);
		}
	};


    const bgtApprove = async() => {
        alert("hello")
        const provider = new ethers.providers.Web3Provider(window.ethereum);

		const signer = provider.getSigner();

		const chainId = await window.ethereum.request({ method: 'eth_chainId' });
		const sf = await Framework.create({
			chainId: Number(chainId),
			provider: provider
		});

         const Matic = new ethers.Contract(
            "0x96B82B65ACF7072eFEb00502F45757F254c2a0D4",
            MATICABI,
            signer
          );

        try {
                        console.log("approving Matic spend");
            await Matic.approve(
              "0xf477275d4a790A6927cfE979e6bfF7E1547808a9",
              ethers.utils.parseEther(amt.toString())
            ).then(function (tx) {
              console.log(
                `Congrats, you just approved your Matic spend. You can see this tx at https://kovan.etherscan.io/tx/${tx.hash}`
              );
            });
        } catch (error) {
            console.log(error)
        }
        
    }

    async function bgtUpgrade(amt) {
      const sf = await Framework.create({
        networkName: "arbitrum-rinkeby",
        provider: customHttpProvider
      });
    
      const signer = sf.createSigner({
        privateKey:
          "0xe5d987d86493515387e1f4f59834dcd469cb86ce7f6e808e7c3f269ea98fbc2b",
        provider: customHttpProvider
      });
    
      const BGTx = await sf.loadSuperToken(
        "0xf477275d4a790A6927cfE979e6bfF7E1547808a9"
      );
    
      try {
        console.log(`upgrading $${amt} BGT to BGTx`);
        const amtToUpgrade = ethers.utils.parseEther(amt.toString());
        const upgradeOperation = BGTx.upgrade({
          amount: amtToUpgrade.toString()
        });
        const upgradeTxn = await upgradeOperation.exec(signer);
        await upgradeTxn.wait().then(function (tx) {
          console.log(
            `
            Congrats - you've just upgraded BGT to BGTx!
          `
          );
        });
      } catch (error) {
        console.error(error);
      }
    }


    const Check_Deposit = async () => {
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const NFTstake = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);
			const options = await NFTstake.isStacked(currentAccount);

			setDeposited(options);
			console.log(options);
		} catch (error) {
			console.log('Error from Check_Deposit ', error);
		}
	};

	const getrented_Domain = async () => {
		setRentedButton(true);
		try {
			const options = {
				address: currentAccount,
				token_address: CONTRACT_ADDRESS,
				chain: 'mumbai'
			};
			const tokenIdMetadata = await Moralis.Web3API.account.getNFTsForContract(
				options
			);
			console.log(tokenIdMetadata);

			setUserOwn(tokenIdMetadata.result);
		} catch (error) {
			console.log('getrented_Domain', error);
		}
	};

	


    const StartRent = async Id => {
	
       
    //    alert(Id);
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);
			const owner = await contract.NFTowner(Id);
			console.log(owner);
			if (owner) {
				const amount = ethers.BigNumber.from('100000000000');
			//	setFlowRate(amount);
				createNewFlow(owner, amount ,Id);
			}
		} catch (error) {
			console.log('Error from Start rent', error);
		}
	};

	async function createNewFlow(recipient,flowRate ,id) {

    
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		const signer = provider.getSigner();

		const chainId = await window.ethereum.request({ method: 'eth_chainId' });
		const sf = await Framework.create({
			chainId: Number(chainId),
			provider: provider
		});

		const MATICx = '0x96B82B65ACF7072eFEb00502F45757F254c2a0D4';

		try {
			const createFlowOperation = sf.cfaV1.createFlow({
				receiver: recipient,
				flowRate: flowRate,
				superToken: MATICx
				// userData?: string
			});

			console.log('Creating your stream...');

			const result = await createFlowOperation.exec(signer);
			console.log(result);
			if (result) {
				transferNFT(recipient);
			} else {
				alert('something went wrong');
			}
			console.log(
				`Congrats - you've just created a money stream!
                View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
                Network: Matic
                Super Token: MATICx
                Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
                Receiver: ${recipient},
                FlowRate: ${flowRate}
    `
			);
		} catch (error) {
			console.log(
				"Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
			);
			console.error(error);
		}
	}

    const transferNFT = async (recipient) => {

		await approval();
         setCounter((prevCount) => prevCount + 1)

		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);

			
			const tx = await contract.rentNFT(recipient);
			const receipt = await tx.wait();
			if (receipt) {
                alert('sucessful')
                setRentcounter(0);
				console.log('Congrate you just rented it ', receipt);
                setCounter(0);
			}
		} catch (error) {
			console.log('Error fromm transferNfts', error);
		}

		//  const web3 = await Moralis.enableWeb3();
		// try {

		// const options = {
		//   type: "erc721",
		//   receiver: currentAccount.toString(),
		//   contractAddress: '0xE2a8798f8579850Fb17Df4D68150293689d1D45C',
		//   tokenId: id.toString(),
		// };
		// let transaction = await Moralis.transfer(options);
		// alert("There you have ")
		// } catch (error) {
		//     console.log("Error from transferNFT", error)
		// }
	};
    


    
	const StopRent = async id => {

        await approval(); 
        setCounter((prevCount) => prevCount + 1)
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);
			const Stoprent = await contract.stopRentingNFT(id);
			const receipt = await Stoprent.wait();
			if (receipt) {
				console.log('Done with renting');
				GetUser(id);
			}
			console.log(Stoprent);
		} catch (error) {
			console.log('Error from Stop rent', error);
		}
	};

    const GetUser = async Id => {
		//alert(Id);
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);
			const owner = await contract.NFTowner(Id);
			console.log(owner);
			if (owner) {
				console.log('Done with Renting, Now Stopping the stream');
				deleteFlow(owner);
			}
		} catch (error) {
			console.log('Error from Start rent', error);
		}
	};

    async function deleteFlow(recipient) {

       setCounter((prevCount) => prevCount + 1)

		const provider = new ethers.providers.Web3Provider(window.ethereum);

		const signer = provider.getSigner();

		const chainId = await window.ethereum.request({ method: 'eth_chainId' });
		const sf = await Framework.create({
			chainId: Number(chainId),
			provider: provider
		});

		const MATICx = '0x96B82B65ACF7072eFEb00502F45757F254c2a0D4';

		try {
			const deleteFlowOperation = sf.cfaV1.deleteFlow({
				sender: currentAccount,
				receiver: recipient,
				superToken: MATICx
				// userData?: string
			});

			console.log('Deleting your stream...');

			await deleteFlowOperation.exec(signer);
            setCounter(0);
            alert("Successful")

			console.log(
				`Congrats - you've just deleted your money stream!
                   Network: Polygon
                   Super Token: MATICx
                   Sender: ${currentAccount}
                   Receiver: ${recipient}
                `
			);
		} catch (error) {
			console.log(
				"Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
			);
			console.error(error);
		}
	}



	

	

	const ShowAllRentable = async () => {
		try {
			const options = { chain: 'mumbai', address: Staking_Contract };
			const NFTs = await Moralis.Web3API.account.getNFTs(options);
			console.log(NFTs);
			setAllRentable(NFTs.result);
			console.log(AllRentable);
		} catch (error) {
			console.log('Error from ShowAllRentable ', error);
		}
	};

	const stake = async DepositNFT => {
		await approval();
		setLoading(true);
		
		setStaked(false);
        setCounter((prevCount) => prevCount + 1)
		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);

		

			let tx = await contract.stake(DepositNFT, 1);
			const receipt = await tx.wait();
			if (receipt) {
                	alert('Sucessful');
            
				console.log(
					'Your Domain is in Vault! https://mumbai.polygonscan.com/tx/' +
						tx.hash
				);
				setLoading(false);
				setStaked(false);
				setUnstaked(true);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const unstake = async () => {
		await approval();
		setUnstaked(false);
        setCounter((prevCount) => prevCount + 1)

		try {
			const { ethereum } = window;
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				Staking_Contract,
				NFT_staker.abi,
				signer
			);

			alert('Unstaking');
			const Unstake = await contract.unstake();
            if(Unstake) {
                	alert('Sucessful');
            }
			console.log(
				'Record set https://mumbai.polygonscan.com/tx/' + Unstake.hash
			);

			await Unstake.wait();

			console.log(Unstake);
			if (Unstake.hash) {
				setLoading(false);
			}
		} catch (error) {}
	};

	

	const approval = async () => {
        setLoading(true);
    //     setCounter((prevCount) => prevCount + 1)
           setRentcounter((prevCount) => prevCount + 1)
		if (mainContract) {
			const tx = await mainContract.setApprovalForAll(Staking_Contract, true);
			const receipt = await tx.wait();
			if (receipt) {
				console.log('Your transaction is approved');
                
			}
		}
	};

	

	const renderRentable = () => {
		if (AllRentable) {
			return (
                <div >
				<div className="mint-container For-margin">
					<p className="subtitle"> Rent Any of these</p>
					<div className="mint-list">
						{AllRentable.map(nfts => {
							let nft_metadata = JSON.parse(nfts.metadata);
							let { name, description, image } = nft_metadata;
							let id = JSON.parse(nfts.token_id);
							console.log(nft_metadata);

							return (
								<div className="mint-item">
									<div className="mint-row">
										<Card style={{ width: '18rem' }}>
											<Card.Img variant="top" src={image} />
											<Card.Body>
												<Card.Title>{name}</Card.Title>
                                                {/*  {id}
                                                    <button onClick={() => transferNFT(id)}> Transfer </button> */}

												<button
													className="cta-button mint-button"
													onClick={() => 
                                                     {StartRent(id)
                                                      setOpen(o => !o);
                                                                   }
                                                    }
												>
													{' '}
													Rent Domain
												</button>
											</Card.Body>
										</Card>
									</div>
								</div>
							);
						})}
					</div>
				</div>
                </div>    
			);
		}
		if (!AllRentable) {
			<h1>Currently there is no NFT to rent</h1>;
		}
	};

	const renderRented = () => {
		if (UserOwn) {
			return UserOwn.map((nft, index) => {
				const temp = JSON.parse(nft.metadata);
				const id = JSON.parse(nft.token_id);
				return (
					<div key={index}>
						<div className="mint-item">
							<Card style={{ width: '18rem' }}>
								<Card.Img variant="top" src={temp.image} />
								<Card.Body>
									<Card.Title>
										{temp.name} {id}
									</Card.Title>
									<button
										className="cta-button mint-button"
										onClick={ () =>
                                            {     
                                                StopRent(id);
                                        setOpen(o => !o);
                                    }
                                        }
									>
										Stop Renting
									</button>
								</Card.Body>
							</Card>
						</div>
					</div>
				);
			});
		}
        if(!UserOwn){
            <h1>Not rented</h1>
        }
	};

	return (
		<div className="App">
			<div className="container">
			 <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                         <div className="modal">
                        <a className="close" onClick={closeModal}>  
                        &times;
                      </a>
                    Transaction {counter}
                <LoadingIndicator />
                    Please Wait
                </div>     
                
              </Popup>
				{RentedButton && renderRented()}
				<div>
                        <Form>
                     
                    
                      {/*  <UpgradeButton
                          onClick={() => {
                            setIsUpgradeButtonLoading(true);
                            bgtUpgrade(amount);
                            setTimeout(() => {
                              setIsUpgradeButtonLoading(false);
                            }, 1000);
                          }}
                        >
                          Click to Upgrade Your Tokens
                        </UpgradeButton>
                      */}</Form>

                           
			
                    {! RentedButton && (
            
             <>
                   <div>
                    		<button  className="rentCompbutton"

						onClick={() => {
							getrented_Domain();
						}}
					>
						{' '}
						Rented{' '}
					</button>
                    </div>
                 <div className="form-container">
                    <div className="first-row">
                    
                     <button className="styled-button" onClick={()=> window.open("https://app.superfluid.finance/dashboard", "_blank")}>Get MATICx</button>
                     
                    </div>
                      </div>   
                 <div align="center">
						<div className="mint-item">
							<div className="mint-row">
								<Card style={{ width: '18rem' }}>
									<Card.Img variant="top" src={props.temp.image} />
									<Card.Body>
										<Card.Title>
											{props.temp.name}
											{props.id}
										</Card.Title>
									</Card.Body>
								</Card>
							</div>
						</div>
					</div>
                 	<Form>
					<FormGroup className="mb-3">
						<FormControl name="id" value={props.id} readOnly />
					</FormGroup>
					<FormGroup className="mb-2">
						<FormControl name="amount" value="1" readOnly />
					</FormGroup>
					{!staked &&
						!Deposited && (
							<button
                                className="rentCompbutton"
								onClick={e => {
									e.preventDefault();
									stake(DepositNFT);
                                     setOpen(o => !o);
								}}
							>
								Staking
							</button>
						)}

					{Unstaked &&
						Deposited && (
							<button
                                 className="rentCompbutton"
								onClick={e => {
									e.preventDefault();
									unstake();
                                    setOpen(o => !o);
								}}
							>
								UnStaking
							</button>
						)}
				</Form>
                 <div>{Deposited && renderRentable()}</div>
                 
             </>
                   
            
                    )}
					
				</div>
			
			</div>
			
			
		</div>
	);
};

export default RentUserDomain;
