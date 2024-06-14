// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract StoryNFT is ERC721 {
    uint256 private _counter;

    mapping(uint256 => string) private uris;

    constructor() ERC721("Story NFT", "SNFT") {}

    function mint(address to, string memory customUri)
        public
        returns (uint256 tokenId)
    {
        tokenId = ++_counter;
        uris[tokenId] = customUri;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        _transfer(from, to, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        return uris[tokenId];
    }
}