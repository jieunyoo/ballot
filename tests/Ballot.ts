import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function giveRightToVote(ballotContract: Ballot, voterAddress: any) {
  const tx = await ballotContract.giveRightToVote(voterAddress);
  await tx.wait();
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: any[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount.toNumber()).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const voterAddress = accounts[1].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight.toNumber()).to.eq(1);
    });

    it("can not give right to vote to someone that has voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote to someone that already has voting rights", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("when the voter interacts with the vote function in the contract", function () {
    it("casts a vote", async function () {
      const proposalIndex  = 1;
      const tx = await ballotContract.vote(proposalIndex);
      await tx.wait();
      const proposal = await ballotContract.proposals(proposalIndex);
      expect(proposal.voteCount.toNumber()).to.eq(1);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", function () {
    it("allow voter to delegate his/her vote", async function () {
      const voterAddress1 = accounts[1].address;
      const voterAddress2 = accounts[2].address;
      const tx = await ballotContract.giveRightToVote(voterAddress1);
      const tx2 = await ballotContract.giveRightToVote(voterAddress2);
      await expect(ballotContract.connect(voterAddress1).delegate(voterAddress2));
      const voter = await ballotContract.voters(voterAddress2);
      expect(voter.weight.toNumber()).to.eq(1);
    });
  }); 

  describe("when an attacker interacts with the giveRightToVote function in the contract", function () {
    it("it doesn't allow someone who isn't the chairperson to give the right to vote to someone", async function () {
      const voterAddress1 = accounts[1].address;
      const voterAddress2 = accounts[2].address;
      const tx = await ballotContract.giveRightToVote(voterAddress1);
      await expect (ballotContract.connect(accounts[1]).giveRightToVote(voterAddress2)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when an attacker interacts with the vote function in the contract", function () {
    it("it doesn't allow someone without a right to vote, to vote", async function () {
      await expect (ballotContract.connect(accounts[1]).vote(2)).to.be.revertedWith("Has no right to vote");     
    });
  });

  describe("when an attacker interacts with the delegate function in the contract", function () {
    it("it doesn't allow an attacker to delegate voting privileges", async function () {
      
      throw new Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });
});