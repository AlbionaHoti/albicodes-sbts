//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract albicodesSBTV2 is Initializable, OwnableUpgradeable, ERC721Upgradeable, ERC721URIStorageUpgradeable {

    // using Counters for Counters.Counter;
    string public baseURI;
    uint256 public tokenId;
    mapping (string => bool) public addressExists;
    mapping (address => uint256[]) private _ownedTokens;
    uint256[49] private __gap;


    // An immutable address for the admin to avoid unnecessary SLOADs before each call
    // at the expense of removing the ability to change the admin once it's set.
    // This is acceptable if the admin is always a ProxyAdmin instance or similar contract
    // with its own ability to transfer the permissions to another account.
    // address private immutable _admin;w
    // address private _implementation;

    // Counters.Counter private _tokenIds;
    string private _baseTokenURI;

    // Constructor to initialize the NFT's name, symbol, and baseTokenURI
    // constructor() ERC721("soulBT Surfer NFT", "SBT") {
    // }

    // Upgradable contract
    // function initialize() public initializer { 
    //     __ERC721_init("soulBT", "SKBT");
    // }

    function initialize() public initializer {
        __ERC721_init("albicodesSBTV2", "ALBISBTV2");
        __Ownable_init();
        __ERC721URIStorage_init();
    }
    
    // Function to mint a new NFT to a specified recipient; only the owner can call this
    function mintTo(address recipient, string memory uri) public onlyOwner {
        require(recipient != address(0), "recipient must not be the zero address");
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);
        tokenId++;
    }

    // added these two func based on error message and suggestions
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    function burn(uint256 id) external {
        require(ownerOf(id) == msg.sender, "Only the owner of the token can burn it.");
        _burn(tokenId);
    }

    function _burn(uint256 id) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(id);
    }
    function tokenURI(uint256 id) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(id);
    }
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // the small snippet: in order for us to block the transfer of NFT and eventually making it "Soulbound."
    // Every time this code will run, the require statement will check: if the from address parameter in 
    // the function is set to zero. If yes, it will allow the action to happen and block all the other 
    // transfers to make it a non-transferable token.
    // ℹ️ Note: When the address from == 0, it means the token is being issued or minted and not transferred.
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenIdd,
        uint256 batchSize
    ) internal override virtual {
        require(from == address(0) || to == address(0), "Err: This a Soulbound token. It cannot be transferred. It can only be burned by the token owner.");

        super._beforeTokenTransfer(from, to, tokenIdd, batchSize);
    }
}
