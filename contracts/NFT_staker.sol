// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";





contract NFT_staker {
    IERC721 public parentNFT;

    struct Stake {
        uint256 tokenId;
        uint256 amount;
        uint256 timestamp;
    }

    struct NFT { 
    address owner;
    address renter;
    uint256 nftId;
     }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

  //  uint256 NFTs;

  //  mapping(uint256 => Stake) private TotalNFTs;
    mapping(uint256 => address) private nftHolders;

    // map staker address to stake details
    mapping(address => Stake) public stakes;

    // map staker to total staking time 
    mapping(address => uint256) public stakingTime;   

    mapping(address => bool) public isStacked;

    constructor() {
        parentNFT = IERC721(0x75D335bBb2bA494138e6C3F2dF30dC78881272fA); // Change it to your NFT contract addr
    }

    function stake(uint256 _tokenId, uint256 _amount) public {
        require(isStacked[msg.sender] == false);
        stakes[msg.sender] = Stake(_tokenId, _amount, block.timestamp); 
        isStacked[msg.sender] = true;
        nftHolders[_tokenId] = msg.sender;
        parentNFT.safeTransferFrom(msg.sender, address(this), _tokenId, "0x00");
   //     NFTs = _tokenIds.current();
     //   TotalNFTs[NFTs] =   Stake(_tokenId, _amount, block.timestamp); 
    } 

    function unstake() public {

        parentNFT.safeTransferFrom(address(this), msg.sender, stakes[msg.sender].tokenId, "0x00");
        stakingTime[msg.sender] += (block.timestamp - stakes[msg.sender].timestamp);
        isStacked[msg.sender] = false;
        delete stakes[msg.sender];
        uint256  Id = stakes[msg.sender].tokenId;
        delete nftHolders[Id];
        
    }      

     function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

   function rentNFT(address _address ) public {
        parentNFT.transferFrom(address(this), msg.sender, stakes[_address].tokenId);
    }

    function stopRentingNFT(uint256 nftId) public {
     //   parentNFT.safeTransferFrom(msg.sender, address(this), nftId, "0x00");
             parentNFT.transferFrom(msg.sender, address(this), nftId);

    }

      function NFTowner(uint256 nftId) public view returns(address owner) {
               return nftHolders[nftId];
    }


}