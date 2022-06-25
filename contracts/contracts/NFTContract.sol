//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "hardhat/console.sol";

contract NFTContract is
    Initializable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    CountersUpgradeable.Counter private _tokenIds;

    bool public _isPreSaleActive;
    mapping(address => bool) private _whiteList;

    /**
    @dev Modifier to check whether msgSender is Owner
     */
    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "caller is not owner!");
        _;
    }

    function initialize(string memory _name, string memory _symbol)
        public
        initializer
    {
        __ERC721_init_unchained(_name, _symbol);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(ADMIN_ROLE, _msgSender());
        _isPreSaleActive = true;
    }

    function create(address user, string memory uri)
        public
        payable
        returns (uint256)
    {
        if (_isPreSaleActive) {
            require(_whiteList[msg.sender], "You are not in the WhiteList");
            _whiteList[msg.sender] = false;
        }        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function onWhiteList(address addr) external view returns (bool) {
        return _whiteList[addr];
    }

    function addToWhiteList(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Can't add the null address");
            _whiteList[addresses[i]] = true;
        }
    }

    function removeFromWhiteList(address[] calldata addresses)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Can't add the null address");
            _whiteList[addresses[i]] = false;
        }
    }

    function enablePreSale(bool _enabled) public onlyOwner {
        _isPreSaleActive = _enabled;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Balance is zero.");
        _withdraw(msg.sender, balance);
    }

    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Transfer failed.");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}
