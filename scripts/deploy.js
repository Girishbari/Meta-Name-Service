const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domain');
    const domainContract = await domainContractFactory.deploy("meta");
    await domainContract.deployed();
  
    console.log("Contract deployed to:", domainContract.address);
  
    // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
      let txn = await domainContract.register("Putin",  {value: hre.ethers.utils.parseEther('0.1')});
      await txn.wait();
   // console.log("Minted domain banana.ninja");
  
    txn = await domainContract.setRecord("Putin", "says Ukrain is mine");
    await txn.wait();
    console.log("Set record for Putin");

    const address = await domainContract.getAddress("Putin");
    console.log("Owner of domain Putin:", address);
  
    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
  }
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();