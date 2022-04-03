// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "../node_modules/hardhat/console.sol";
import { StringUtils } from "./libraries/StringUtils.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";



import { Base64 } from "./libraries/Base64.sol";

contract Domain is ERC721URIStorage{



 
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    string public tld;

    // We'll be storing our NFT images on chain as SVGs
    string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-10.081 6.032-6.85 3.934-10.081 6.032c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616c-.384-.665-.594-1.418-.608-2.187v-9.31c-.013-.775.185-1.538.572-2.208a4.25 4.25 0 0 1 1.625-1.595l7.884-4.59c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v6.032l6.85-4.065v-6.032c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595L41.456 24.59c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595c-.387.67-.585 1.434-.572 2.208v17.441c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l10.081-5.901 6.85-4.065 10.081-5.901c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v9.311c.013.775-.185 1.538-.572 2.208a4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616c-.385-.665-.594-1.418-.608-2.187v-6.032l-6.85 4.065v6.032c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l14.864-8.655c.657-.394 1.204-.95 1.589-1.616s.594-1.418.609-2.187V55.538c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#00ff"/><defs><linearGradient id="B" x1="3" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="fssff"/><stop offset="1" stop-color="#0c7e4" stop-opacity=".99"/></linearGradient></defs><text x="52.5" y="151" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
    string svgPartTwo = '</text></svg>';


    mapping(string => address) public domains;
    mapping(string => string) public records;  
    mapping(address => string) public userAddress;
    mapping(string => bool) public isOwned;
    uint256 newRecordId ; 
    address payable public owner;
    mapping (uint => string) public names; 
    mapping (uint => address) public DomainOwneraddress;


    constructor(string memory _tld) payable ERC721( "Meta Name Service", "MNS") {
      tld = _tld;
      console.log("%s name service deployed", _tld);
     }
	
    modifier onlyOwner() {
      require(isOwner());
      _;
    }

    function valid(string calldata name) public pure returns(bool) {
         if (StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 7 ){
           return true;
         } 
         else
         {
           
           return false;
         }
    }

    function getAllNames() public view returns (string[] memory) {
      console.log("Getting all names from contract");
      string[] memory allNames = new string[](_tokenIds.current());
    //  address[] memory DomainUserAddress = new address[](_tokenIds.current());
      for (uint i = 0; i < _tokenIds.current(); i++) {
       allNames[i] = names[i];
    //   DomainUserAddress[i] = DomainOwneraddress[i];
       console.log("Name for token %d is %s", i, allNames[i]);
    }   

     return (allNames);
  }

    function isOwner() public view returns (bool) {
      return msg.sender == owner;
    }

    function withdraw() public onlyOwner {
	    uint amount = address(this).balance;
	
	    (bool success, ) = msg.sender.call{value: amount}("");
	    require(success, "Failed to withdraw Matic");
    }  



    function priceCheck(string calldata name) public pure returns(uint){
     
     
     uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 2 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
    } else if (len == 4) {
      return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
    } else {
      return 1 * 10**17;
    }
    }


    function register(string calldata name) public payable {
        
        require(isOwned[name]!=true);
        require(valid(name) == true);
        require(domains[name] == address(0));       
        domains[name] = msg.sender;
        userAddress[msg.sender] = name; 
        isOwned[name] = true;
        uint256 _priceCheck = priceCheck(name);

        require(msg.value >= _priceCheck, "Not enough Matic paid");
        string memory _name = string(abi.encodePacked(name,".",tld));
        string memory finalsvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));
        newRecordId = _tokenIds.current();

        uint256 length = StringUtils.strlen(name);
	    	string memory strLen = Strings.toString(length);

        console.log("Registering %s.%s on the contract with tokenID %d", name, tld, newRecordId);


        		// Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
        string memory json = Base64.encode(
         bytes(
         string(
          abi.encodePacked(
            '{"name": "',
            _name,
            '", "description": "A domain on the Meta name service", "image": "data:image/svg+xml;base64,',
            Base64.encode(bytes(finalsvg)),
            '","length":"',
            strLen,
            '"}'
                    )
                )
            )
        );
    
     string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));

      console.log("\n--------------------------------------------------------");
	  console.log("Final tokenURI", finalTokenUri);
	  console.log("--------------------------------------------------------\n");
    // ownerDomainCount++;
    _safeMint(msg.sender, newRecordId);
    _setTokenURI(newRecordId, finalTokenUri);

    _tokenIds.increment();
    names[newRecordId] = name;
    DomainOwneraddress[newRecordId]=msg.sender;
     
     console.log("%s has registered the domain", msg.sender);
    }

    function getAddress(string calldata name) public view returns(address) {
        return domains[name];
    }

    function setRecord(string calldata name, string calldata record) public  {
            require(domains[name] == msg.sender);
            records[name] = record;
    }
    
    function getRecord(string calldata name) public view returns(address _address,string memory, string memory){
        return (domains[name], name, records[name]);
    }

    function getRecordByAddress(address _owner) public view returns(string memory)  {
         require(msg.sender == _owner);
         return(userAddress[_owner]);
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
             _setApprovalForAll(_msgSender(), operator, approved);
             console.log("approved");
     }

  

    
}

