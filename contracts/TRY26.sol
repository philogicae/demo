// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC721Metadata} from '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol';
import {IERC721Enumerable} from '@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {ERC165} from '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Strings} from '@openzeppelin/contracts/utils/Strings.sol';
import {PaginatedEnumerableSet} from 'paginated-enumerableset/contracts/PaginatedEnumerableSet.sol';

contract TRY26 is
  IERC721,
  IERC721Metadata,
  IERC721Enumerable,
  ERC165,
  EIP712,
  Ownable
{
  /* ------------ Libraries ------------ */

  using Strings for uint256;
  using PaginatedEnumerableSet for *;

  /* ------------ Structs ------------ */

  struct Batch {
    uint128 metadataId;
    uint128 createdAt;
    address admin;
  }

  struct Token {
    address owner;
    uint256 batchId;
    bytes32 ticketId;
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

  struct FullToken {
    Token token;
    Batch batch;
  }

  /* ------------ Constants ------------ */

  address private constant ZERO_ADDRESS =
    0x0000000000000000000000000000000000000000;
  uint256 private constant SAFETY_DELAY = 1 minutes;
  bytes32 private constant PREMINT_PERMIT_TYPEHASH =
    keccak256(
      'PreMintPermit(address admin,uint256 batchId,bytes32 batchSecret)'
    );

  string private constant __name = 'TwentySix Soulbound';
  string private constant __symbol = 'TRY26';
  string private constant __version = '1';
  string private constant _baseURI = 'https://demo.binaryeyelabs.xyz';

  /* ------------ Storage ------------ */

  uint256 public totalBatches;
  uint256 public totalTickets;
  mapping(uint256 batchId => Batch) private _batches;
  mapping(uint256 batchId => PaginatedEnumerableSet.Bytes32Set)
    private _tickets;

  mapping(bytes32 reservation => uint256 timestamp) private _reservations;

  uint256 private _totalTokens;
  mapping(bytes32 ticketId => uint256) private _tokenIds;
  mapping(uint256 tokenId => Token) private _tokens;
  mapping(address => PaginatedEnumerableSet.UintSet) private _claimedTokenIds;

  /* ------------ Events ------------ */

  event BatchPreMinted(
    uint256 indexed batchId,
    uint128 indexed metadataId,
    address indexed admin,
    uint256 nbTickets
  );
  event TicketReserved(
    address indexed owner,
    bytes32 reservation,
    uint256 unlock
  );
  /* Any transfer is de facto a mint, so no extra event needed */

  /* ------------ Errors ------------ */

  error MethodNotAllowed();
  error InvalidBatch();
  error IndexOutOfBounds();
  error ReservationNotChanged(bytes32 reservation);
  error ReservationNotFound(bytes32 reservation);
  error TicketNotFound(uint256 batchId, bytes32 ticketId);
  error TicketAlreadyClaimed(uint256 batchId, bytes32 ticketId);
  error InvalidSigner(address admin, address signer);

  /* ------------ Constructor ------------ */

  constructor() EIP712(__name, __version) Ownable(_msgSender()) {
    address to = _msgSender();
    bytes32 ticketId = bytes32('abcde');
    uint256 batchId = ++totalBatches;
    _batches[batchId] = Batch(1, uint128(block.timestamp), to);
    _tickets[batchId].add(ticketId);
    totalTickets++;
    emit BatchPreMinted(batchId, 1, to, 1);
    uint256 tokenId = ++_totalTokens;
    _tokenIds[ticketId] = tokenId;
    _tokens[tokenId] = Token(to, batchId, ticketId);
    _claimedTokenIds[to].add(tokenId);
    emit Transfer(ZERO_ADDRESS, to, tokenId);
  }

  /* ------------ IERC165 Methods ------------ */

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC165, IERC165) returns (bool) {
    return
      interfaceId == type(IERC721).interfaceId ||
      interfaceId == type(IERC721Metadata).interfaceId ||
      interfaceId == type(IERC721Enumerable).interfaceId ||
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
        '/sbt/metadata/',
        Strings.toString(_batches[_tokens[tokenId].batchId].metadataId),
        '.json'
      );
  }

  /* ------------ ERC7572 Methods ------------ */

  function contractURI() public pure returns (string memory) {
    return string.concat(_baseURI, '/sbt/contractURI.json');
  }

  /* ------------ IERC721Enumerable Methods ------------ */

  function totalSupply() external view override returns (uint256) {
    return _totalTokens;
  }

  function tokenOfOwnerByIndex(
    address target,
    uint256 index
  ) external view override returns (uint256 tokenId) {
    PaginatedEnumerableSet.UintSet storage claimedTokenIds = _claimedTokenIds[
      target
    ];
    if (index >= claimedTokenIds.length()) revert IndexOutOfBounds();
    tokenId = claimedTokenIds.at(index);
  }

  function tokenByIndex(
    uint256 index
  ) external view override returns (uint256) {
    if (index > _totalTokens) revert IndexOutOfBounds();
    return index;
  }

  /* ------------ IERC721 Methods ------------ */

  function balanceOf(address target) public view returns (uint256) {
    return _claimedTokenIds[target].length();
  }

  function ownerOf(uint256 tokenId) public view returns (address) {
    return _tokens[tokenId].owner;
  }

  /* ------------ View Methods ------------ */

  function getBatch(
    uint256 batchId
  )
    public
    view
    returns (uint128 metadataId, uint128 createdAt, uint256 nbTickets)
  {
    if (batchId > totalBatches) revert IndexOutOfBounds();
    Batch memory batch = _batches[batchId];
    metadataId = batch.metadataId;
    createdAt = batch.createdAt;
    nbTickets = _tickets[batchId].length();
  }

  function ticketsByBatch(
    uint256 batchId,
    uint256 start,
    uint256 size
  ) public view returns (bytes32[] memory tickets) {
    if (batchId > totalBatches) revert IndexOutOfBounds();
    PaginatedEnumerableSet.Bytes32Set storage batchTickets = _tickets[batchId];
    if (start + size > batchTickets.length()) revert IndexOutOfBounds();
    tickets = batchTickets.subset(start, size);
  }

  function tokenIdByTicketId(
    bytes32 ticketId
  ) external view returns (uint256 tokenId) {
    tokenId = _tokenIds[ticketId];
  }

  function tokenIdsByOwner(
    address target,
    uint256 start,
    uint256 size
  ) external view returns (uint256[] memory tokenIds) {
    PaginatedEnumerableSet.UintSet storage claimedTokenIds = _claimedTokenIds[
      target
    ];
    if (start + size > claimedTokenIds.length()) revert IndexOutOfBounds();
    tokenIds = claimedTokenIds.subset(start, size);
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
  ) external onlyOwner returns (uint256 batchId) {
    address _owner = owner();
    batchId = ++totalBatches;
    if (tickets.length == 0) revert InvalidBatch();
    _batches[batchId] = Batch(metadataId, uint128(block.timestamp), _owner);
    PaginatedEnumerableSet.Bytes32Set storage ticketIds = _tickets[batchId];
    for (uint256 i = 0; i < tickets.length; i++) {
      ticketIds.add(tickets[i]);
    }
    totalTickets += tickets.length;
    emit BatchPreMinted(batchId, metadataId, _owner, tickets.length);
  }

  function reserve(bytes32 reservation) external {
    if (_reservations[reservation] > 0) {
      revert ReservationNotChanged(reservation);
    }
    uint256 unlock = block.timestamp + SAFETY_DELAY;
    _reservations[reservation] = unlock;
    emit TicketReserved(_msgSender(), reservation, unlock);
  }

  function claim(Ticket memory ticket) external {
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
    _claimedTokenIds[claimer].add(tokenId);
    emit Transfer(ZERO_ADDRESS, claimer, tokenId);
  }

  function _permitTicket(
    Ticket memory ticket
  ) private view returns (bytes32 ticketId) {
    ticketId = keccak256(
      abi.encodePacked(ticket.batchSecret, ticket.ticketSecret)
    );
    PaginatedEnumerableSet.Bytes32Set storage tickets = _tickets[
      ticket.batchId
    ];
    if (!tickets.contains(ticketId)) {
      revert TicketNotFound(ticket.batchId, ticketId);
    }
    if (_tokenIds[ticketId] > 0) {
      revert TicketAlreadyClaimed(ticket.batchId, ticketId);
    }
    address admin = _batches[ticket.batchId].admin;
    address signer = ecrecover(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            PREMINT_PERMIT_TYPEHASH,
            admin,
            ticket.batchId,
            ticket.batchSecret
          )
        )
      ),
      ticket.signature.v,
      ticket.signature.r,
      ticket.signature.s
    );
    if (signer != admin) revert InvalidSigner(admin, signer);
  }

  /* ------------ IERC721 Banned Methods ------------ */

  function safeTransferFrom(address, address, uint256) public pure {
    revert MethodNotAllowed();
  }

  function safeTransferFrom(
    address,
    address,
    uint256,
    bytes memory
  ) public pure {
    revert MethodNotAllowed();
  }

  function transferFrom(address, address, uint256) public pure {
    revert MethodNotAllowed();
  }

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
}
