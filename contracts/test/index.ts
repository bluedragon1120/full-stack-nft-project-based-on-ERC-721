import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

let owner: any;
let user: any;
const uri = "https://gateway.pinata.cloud/ipfs/Qme2AwawrQoBYbE21UPQtfSkcZ3KYAQMMh6z61paJ4i4bw";

describe("NFTContract", function () {
  it("Should return same address with one that minted NFT", async function () {
    [owner, user] = await ethers.getSigners();
    const NFTContract = await ethers.getContractFactory("NFTContract");
    const nftContract = await upgrades.deployProxy(NFTContract, [
      "My NFT",
      "MNFT"
    ], {
      initializer: "initialize",
    });
    await nftContract.deployed();

    let tx = await nftContract.connect(owner).addToWhiteList([user.address]);
    await tx.wait();

    tx = await nftContract.connect(user).create(user.address, uri);
    await tx.wait();

    expect(await nftContract.ownerOf("1")).to.equal(user.address);
  });
});