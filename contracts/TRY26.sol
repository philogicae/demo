// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {PaginatedEnumerableSet} from "paginated-enumerableset/contracts/PaginatedEnumerableSet.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ERC2771Context} from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

/**
 * @dev Custom implementation of Non-Fungible Token Standard, including SoulBound Token features,
 * dynamic offchain metadata, permissionned management by contract owner, commit-reveal pattern for claimable tickets.
 */
contract TRY26 is
    IERC721,
    IERC721Metadata,
    IERC721Enumerable,
    ERC165,
    EIP712,
    IERC4906,
    Ownable,
    ERC2771Context
{
    /* ------------ Libraries ------------ */

    using Strings for uint256;
    using PaginatedEnumerableSet for *;

    /* ------------ Structs ------------ */

    struct Batch {
        uint128 metadataId;
        uint128 createdAt;
        address creator;
        uint96 totalTickets;
    }

    struct Token {
        address owner;
        uint256 batchId;
        bytes32 ticketId;
    }

    struct FullToken {
        Token token;
        Batch batch;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct Ticket {
        uint256 batchId;
        bytes32 batchSecret;
        bytes32 ticketSecret;
        Signature signature;
    }

    /* ------------ Constants ------------ */

    uint256 private constant SAFETY_DELAY = 1 minutes;
    bytes32 private constant PREMINT_PERMIT_TYPEHASH =
        keccak256(
            "PreMintPermit(address creator,uint256 batchId,bytes32 batchSecret)"
        );

    string private constant __name = "TwentySix Claim";
    string private constant __symbol = "TRY26";
    string private constant __version = "1";
    string private constant _baseURI = "https://claim.twentysix.cloud";

    /* ------------ Storage ------------ */

    uint256 public totalBatches;
    uint256 public totalTickets;
    mapping(uint256 batchId => Batch) private _batches;
    mapping(uint256 batchId => PaginatedEnumerableSet.Bytes32Set)
        private _tickets;

    mapping(bytes32 reservation => uint256 timestamp) private _reservations;

    uint256 private _totalTokens;
    uint256 private _totalBurned;
    mapping(bytes32 ticketId => uint256) private _tokenIds;
    mapping(uint256 tokenId => Token) private _tokens;
    mapping(address => PaginatedEnumerableSet.UintSet) private _ownedTokenIds;

    /* ------------ Events ------------ */

    event BatchPreMint(
        uint256 indexed batchId,
        uint128 indexed metadataId,
        address indexed creator,
        uint256 nbTickets
    );
    event BatchMint(
        uint256 indexed batchId,
        uint128 indexed metadataId,
        address indexed creator,
        uint256 amount
    );
    event TicketReserved(
        address indexed owner,
        bytes32 reservation,
        uint256 unlock
    );
    /* Transfer event is emitted at mint. Used by marketplaces to index new tokens */
    // Custom event for Aleph indexer
    event Mint(
        address indexed claimer,
        uint256 indexed tokenId,
        uint128 indexed metadataId
    );

    /* ------------ Errors ------------ */

    error MethodNotAllowed();
    error InvalidBatch();
    error IndexOutOfBounds();
    error ReservationNotChanged(bytes32 reservation);
    error ReservationNotFound(bytes32 reservation);
    error TicketNotFound(uint256 batchId, bytes32 ticketId);
    error TicketAlreadyClaimed(uint256 batchId, bytes32 ticketId);
    error InvalidSigner(address creator, address signer);
    error TokenNotFound(uint256 tokenId);
    error ERC721InvalidReceiver(address receiver);
    error ERC721IncorrectOwner(
        address from,
        uint256 tokenId,
        address previousOwner
    );

    /* ------------ Constructor ------------ */

    constructor()
        EIP712(__name, __version)
        Ownable(msg.sender)
        ERC2771Context(0xd8253782c45a12053594b9deB72d8e8aB2Fca54c) // TODO: GelatoRelayERC2771
    {}

    /* ------------ IERC165 Methods ------------ */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721Enumerable).interfaceId ||
            interfaceId == type(IERC4906).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /* ------------ IERC721Metadata Methods ------------ */

    function name() public pure returns (string memory) {
        return __name;
    }

    function symbol() public pure returns (string memory) {
        return __symbol;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return
            string.concat(
                _baseURI,
                "/sbt/metadata/",
                Strings.toString(_batches[_tokens[tokenId].batchId].metadataId),
                ".json"
            );
    }

    /* ------------ ERC4906 Methods ------------ */

    function notifyMetadataUpdate() external onlyOwner {
        emit BatchMetadataUpdate(1, type(uint256).max);
    }

    /* ------------ ERC7572 Methods ------------ */

    function contractURI() public pure returns (string memory) {
        return string.concat(_baseURI, "/sbt/contractURI.json");
    }

    /* ------------ IERC721Enumerable Methods ------------ */

    function totalSupply() public view override returns (uint256) {
        return _totalTokens - _totalBurned;
    }

    function tokenOfOwnerByIndex(
        address target,
        uint256 index
    ) public view override returns (uint256 tokenId) {
        PaginatedEnumerableSet.UintSet storage ownedTokenIds = _ownedTokenIds[
            target
        ];
        if (index >= ownedTokenIds.length()) revert IndexOutOfBounds();
        tokenId = ownedTokenIds.at(index);
    }

    function tokenByIndex(
        uint256 index
    ) public view override returns (uint256) {
        if (index > _totalTokens) revert IndexOutOfBounds();
        return index;
    }

    /* ------------ IERC721 Methods ------------ */

    function balanceOf(address target) public view returns (uint256) {
        return _ownedTokenIds[target].length();
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return _tokens[tokenId].owner;
    }

    /* ------------ View Methods ------------ */

    function getReservation(
        bytes32 reservation
    ) public view returns (uint256 unlock) {
        unlock = _reservations[reservation];
    }

    function getBatch(
        uint256 batchId
    ) public view returns (Batch memory batch) {
        if (batchId > totalBatches) revert IndexOutOfBounds();
        batch = _batches[batchId];
    }

    function ticketsByBatch(
        uint256 batchId,
        uint256 start,
        uint256 size
    ) public view returns (bytes32[] memory tickets) {
        if (batchId > totalBatches) revert IndexOutOfBounds();
        PaginatedEnumerableSet.Bytes32Set storage batchTickets = _tickets[
            batchId
        ];
        if (start + size > batchTickets.length()) revert IndexOutOfBounds();
        tickets = batchTickets.subset(start, size);
    }

    function tokenIdByTicketId(
        bytes32 ticketId
    ) public view returns (uint256 tokenId) {
        tokenId = _tokenIds[ticketId];
    }

    function tokenIdsByOwner(
        address target,
        uint256 start,
        uint256 size
    ) public view returns (uint256[] memory tokenIds) {
        PaginatedEnumerableSet.UintSet storage ownedTokenIds = _ownedTokenIds[
            target
        ];
        if (start + size > ownedTokenIds.length()) revert IndexOutOfBounds();
        tokenIds = ownedTokenIds.subset(start, size);
    }

    function getToken(uint256 tokenId) public view returns (Token memory) {
        return _tokens[tokenId];
    }

    function getFullToken(
        uint256 tokenId
    ) public view returns (FullToken memory) {
        Token memory token = _tokens[tokenId];
        Batch memory batch = _batches[token.batchId];
        return FullToken(token, batch);
    }

    /* ------------ Core Methods ------------ */

    function preMint(
        uint128 metadataId,
        bytes32[] calldata tickets
    ) external onlyOwner {
        if (tickets.length == 0) revert InvalidBatch();
        uint256 batchId = ++totalBatches;
        address creator = _msgSender();
        _batches[batchId] = Batch(
            metadataId,
            uint128(block.timestamp),
            creator,
            uint96(tickets.length)
        );
        PaginatedEnumerableSet.Bytes32Set storage ticketIds = _tickets[batchId];
        for (uint256 i = 0; i < tickets.length; i++) {
            ticketIds.add(tickets[i]);
        }
        totalTickets += tickets.length;
        emit BatchPreMint(batchId, metadataId, creator, tickets.length);
    }

    function reserve(bytes32 reservation) public {
        if (_reservations[reservation] > 0) {
            revert ReservationNotChanged(reservation);
        }
        uint256 unlock = block.timestamp + SAFETY_DELAY;
        _reservations[reservation] = unlock;
        emit TicketReserved(_msgSender(), reservation, unlock);
    }

    function claim(Ticket memory ticket) public {
        address claimer = _msgSender();
        bytes32 reservation = keccak256(
            abi.encodePacked(claimer, ticket.batchSecret, ticket.ticketSecret)
        );
        uint256 reservationTime = _reservations[reservation];
        if (reservationTime == 0 || block.timestamp < reservationTime) {
            revert ReservationNotFound(reservation);
        }
        bytes32 ticketId = _permitTicket(ticket);
        uint256 tokenId = ++_totalTokens;
        _tokenIds[ticketId] = tokenId;
        _tokens[tokenId] = Token(claimer, ticket.batchId, ticketId);
        _ownedTokenIds[claimer].add(tokenId);
        emit Transfer(address(0), claimer, tokenId);
        emit Mint(claimer, tokenId, _batches[ticket.batchId].metadataId);
    }

    function _permitTicket(
        Ticket memory ticket
    ) private view returns (bytes32 ticketId) {
        ticketId = keccak256(
            abi.encodePacked(ticket.batchSecret, ticket.ticketSecret)
        );
        if (!_tickets[ticket.batchId].contains(ticketId)) {
            revert TicketNotFound(ticket.batchId, ticketId);
        }
        if (_tokenIds[ticketId] > 0) {
            revert TicketAlreadyClaimed(ticket.batchId, ticketId);
        }
        address creator = _batches[ticket.batchId].creator;
        address signer = ecrecover(
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        PREMINT_PERMIT_TYPEHASH,
                        creator,
                        ticket.batchId,
                        ticket.batchSecret
                    )
                )
            ),
            ticket.signature.v,
            ticket.signature.r,
            ticket.signature.s
        );
        if (signer != creator) revert InvalidSigner(creator, signer);
    }

    function mint(uint128 metadataId, uint256 amount) external onlyOwner {
        uint256 batchId = ++totalBatches;
        address creator = _msgSender();
        _batches[batchId] = Batch(
            metadataId,
            uint128(block.timestamp),
            creator,
            uint96(0)
        );
        emit BatchMint(batchId, metadataId, creator, amount);
        uint256 tokenId = _totalTokens + 1;
        uint256 max = tokenId + amount;
        for (; tokenId < max; tokenId++) {
            _tokens[tokenId] = Token(creator, batchId, 0);
            _ownedTokenIds[creator].add(tokenId);
            emit Transfer(address(0), creator, tokenId);
            emit Mint(creator, tokenId, metadataId);
        }
        _totalTokens = max - 1;
    }

    function burn(uint256 tokenId) external onlyOwner {
        address tokenOwner = _tokens[tokenId].owner;
        if (tokenOwner == address(0)) revert TokenNotFound(tokenId);
        _ownedTokenIds[tokenOwner].remove(tokenId);
        delete _tokens[tokenId];
        _totalBurned++;
        emit Transfer(tokenOwner, address(0), tokenId);
    }

    /* ------------ IERC721 Transfer Methods ------------ */

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyOwner {
        if (to == address(0)) revert ERC721InvalidReceiver(address(0));
        Token storage token = _tokens[tokenId];
        address previousOwner = token.owner;
        if (previousOwner == address(0)) revert TokenNotFound(tokenId);
        if (previousOwner != from)
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        _ownedTokenIds[from].remove(tokenId);
        _ownedTokenIds[to].add(tokenId);
        token.owner = to;
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory
    ) public override {
        transferFrom(from, to, tokenId);
    }

    /* ------------ IERC721 Banned Methods ------------ */

    function approve(address, uint256) public pure {
        revert MethodNotAllowed();
    }

    function setApprovalForAll(address, bool) public pure {
        revert MethodNotAllowed();
    }

    function getApproved(uint256) public pure returns (address) {
        revert MethodNotAllowed();
    }

    function isApprovedForAll(address, address) public pure returns (bool) {
        revert MethodNotAllowed();
    }

    /* ------------ ERC2771Context Methods ------------ */

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return msg.sender;
        }
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return msg.data;
        }
    }
}
