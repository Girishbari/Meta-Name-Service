const main = async() => {
    
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const NFTStaker = await hre.ethers.getContractFactory('NFT_staker');
    const NFTStaker_Contract = await NFTStaker.deploy();
    await NFTStaker_Contract.deployed();
    console.log("Contract deployed", NFTStaker_Contract.address);
    console.log("Contract deployed by", owner.address);



//     const register =  await domainContract.register("Hello", {value: hre.ethers.utils.parseEther('1234')});
//     await register.wait();

//     const domainOwner = await domainContract.getAddress("Hello");
//     console.log("Domain owned by", domainOwner);
    
//     txn = await domainContract.connect(owner).setRecord("Hello", "Haha my domain now!");
//     await txn.wait();

//      const getRecord = await domainContract.getRecord("Hello")
//      console.log("Domain name and its record respectively",getRecord,"records")

//      const priceCheck = await hre.ethers.provider.getBalance(domainContract.address);
//      console.log("Contract balance:", hre.ethers.utils.formatEther(priceCheck));

//      try {
//          txn = await domainContract.connect(Superhero).withdraw();
//          await txn.wait();
//      } catch (error) {
//          console.log("could not rob contract")
//      }
//      let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
//      console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
   
//      txn = await domainContract.connect(owner).withdraw();
//      await txn.wait();
  
//   // Fetch balance of contract & owner
//   const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
//   ownerBalance = await hre.ethers.provider.getBalance(owner.address);

//   console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
//   console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
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