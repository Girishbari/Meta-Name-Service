import React, { useEffect, useState } from 'react';
import './UserOwnDomain.css';
import contractAbi from '../../utils/contractABI.json';
import { Staking_Contract } from '../RentUserDomain/constant.jsx';
import NFTstaker from '../RentUserDomain/contractABI.json';
import { Framework } from '@superfluid-finance/sdk-core';

import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import {
	Button,
	Form,
	FormGroup,
	FormControl,
	Spinner,
	Card
} from 'react-bootstrap';
import { CONTRACT_ADDRESS } from '../../constant.jsx';

const UserOwnDomain = props => {
	const tld = '.meta';

	const setCurrentAccount = props.account;
	const [UserOwn, setUserOwn] = useState([]);
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [editing, setEditing] = useState(false);
	const provider = new ethers.providers.Web3Provider(ethereum);

	const { Moralis } = useMoralis();

	console.log(setCurrentAccount);

	const rentDomain = async () => {
		try {
			const options = {
				address: setCurrentAccount,
				token_address: CONTRACT_ADDRESS,
				chain: 'mumbai'
			};
			const tokenIdMetadata = await Moralis.Web3API.account.getNFTsForContract(
				options
			);
			console.log(tokenIdMetadata);

			setUserOwn(tokenIdMetadata.result);
			if (!UserOwn) {
				alert('Your dont own any');
			}
		} catch (error) {
			alert("Maybe you don't Own");
		}
	};

    


    
	


	const updateDomain = async () => {
		if (!record || !domain) {
			return;
		}
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

				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (UserOwn) {
			rentDomain();
		}
	}, []);

	const renderinputForm = () => {
		return (
			<div className="form-container">
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
						<button className="cta-button mint-button" onClick={updateDomain}>
							Set record
						</button>

						<button
							className="cta-button mint-button"
							onClick={() => {
								setEditing(false);
							}}
						>
							Cancel
						</button>
					</div>
				) : null}
			</div>
		);
	};

	const editRecord = name => {
		console.log('Editing record for', name);
		setEditing(true);
		setDomain(name);
	};

	return (
		<div className="App">
			{editing && renderinputForm()}

			{UserOwn &&
				UserOwn.map((nft, index) => {
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
									
										{setCurrentAccount ? (
											<button
												className="edit-button"
												onClick={() => editRecord(temp.name)}
											>
												<img
													className="edit-icon"
													src="https://img.icons8.com/metro/26/000000/pencil.png"
													alt="Edit button"
												/>
											</button>
										) : null}
									</Card.Body>
								</Card>
							</div>
						</div>
					);
				})}
			{!UserOwn && <h1>Domain Not available</h1>}
		</div>
	);
};

export default UserOwnDomain;
