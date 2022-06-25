import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying NFT Contract...");
  const NFTContract = await ethers.getContractFactory("NFTContract");
  const nftContract = await upgrades.deployProxy(NFTContract, ["My NFT", "MNFT"], {
    initializer: "initialize",
  });
  await nftContract.deployed();
  console.log("NFT Contract deployed to:", nftContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
