const main = async() => {
    
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const domainContractFactory = await hre.ethers.getContractFactory('Domain');
    const domainContract = await domainContractFactory.deploy("meta");
    await domainContract.deployed();
    console.log("Contract deployed", domainContract.address);
    console.log("Contract deployed by", owner.address);

    const register =  await domainContract.register("Hello", {value: hre.ethers.utils.parseEther('1234')});
    await register.wait();

    const domainOwner = await domainContract.getAddress("Hello");
    console.log("Domain owned by", domainOwner);
    
    txn = await domainContract.connect(owner).setRecord("Hello", "Your are gone");
    await txn.wait();

     const stake = await domainContract.setApprovalForAll("0x5FbDB2315678afecb367f032d93F642f64180aa3", true)
     await stake.wait;
     const getRecord = await domainContract.getRecord("Hello")
     console.log("Domain name and its record respectively",getRecord,"records")
     

     const priceCheck = await hre.ethers.provider.getBalance(domainContract.address);
     console.log("Contract balance:", hre.ethers.utils.formatEther(priceCheck));

     try {
         txn = await domainContract.connect(owner).withdraw();
         await txn.wait();
     } catch (error) {
         console.log("could not rob contract")
     }
     let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
     console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
   
     txn = await domainContract.connect(owner).withdraw();
     await txn.wait();
  
  // Fetch balance of contract & owner
  const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
  ownerBalance = await hre.ethers.provider.getBalance(owner.address);

  console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
  console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

 
} 

const runMain = async() => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error)
        process.exit(0);

    }
}

runMain();