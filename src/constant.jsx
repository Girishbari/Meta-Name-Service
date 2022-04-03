const  transformNFTData = (characterData) => {
  return {
  name:   characterData.name,
  imageURI: characterData.imageURI,
   };
};

 const CONTRACT_ADDRESS = '0x75D335bBb2bA494138e6C3F2dF30dC78881272fA' ;

export {transformNFTData, CONTRACT_ADDRESS};