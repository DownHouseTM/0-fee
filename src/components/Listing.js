import { useState, useEffect } from "react";
import { contracts } from "../contracts/contracts";
import { useAccount } from "wagmi";
import { hexToNumber } from "viem";
import ListingModal from "./Modals/ListingModal";

export default function Listing() {
  const account = useAccount();

  const [fetching0F, setFetching0F] = useState(false);
  const [fetched0F, setFetched0F] = useState(false);
  const [fetchedAll, setFetchedAll] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [all0FNfts, setAll0FNfts] = useState([]);
  const [allNfts, setAllNfts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nftToList, setNftToList] = useState({
    title: "",
    address: "",
    tokenId: "",
  });

  const resetPage = () => {
    setFetching0F(false);
    setFetchingAll(false);
    setAll0FNfts([]);
    setAllNfts([]);
    setShowModal(false);
    setNftToList({
      title: "",
      address: "",
      tokenId: "",
    });
  };

  const closeModal = () => {
    setNftToList({ title: "", address: "", tokenId: "" });
    setShowModal(false);
  };

  useEffect(() => {
    resetPage();
  }, [account.chainId, account.address]);

  useEffect(() => {
    if (
      nftToList.length === 0 ||
      nftToList.title.length === 0 ||
      nftToList.tokenId.length === 0
    )
      return;
    setShowModal(true);
  }, [nftToList]);

  const fetchNFTs = async (collection) => {
    let nfts;

    const api_key = "XQYE9fHdpqu1yveYkQQwqM5lVYTk477V";

    const baseURL = `${contracts[account.chain.id].api}${api_key}/getNFTs/`;
    let requestOptions = {
      method: "GET",
    };

    if (!collection.length) {
      setFetchingAll(true);
      const fetchURL = `${baseURL}?owner=${account.address}`;

      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());

      if (nfts) setAllNfts(nfts.ownedNfts);

      setFetchedAll(true);
      setFetchingAll(false);
    } else {
      setFetching0F(true);
      setFetched0F(true);

      const fetchURL = `${baseURL}?owner=${account.address}&contractAddresses%5B%5D=${collection}`;

      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());

      if (nfts) setAll0FNfts(nfts.ownedNfts);

      setFetching0F(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="p-4 border border-black rounded-2xl flex flex-col justify-center items-center">
          {!fetching0F && (
            <button
              className="p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
              onClick={() =>
                fetchNFTs([contracts[account.chain.id].nft.address])
              }
            >
              Fetch My 0F NFTs
            </button>
          )}
          {fetching0F && <p>Please wait...</p>}
          {!fetching0F && fetched0F && all0FNfts.length > 0 && (
            <div className="mt-4 w-full">
              {all0FNfts.map((nft, i) => (
                <div
                  key={`0f-${i}`}
                  className="flex flex-col sm:flex-row my-2 border border-black p-2 rounded-2xl items-center justify-center"
                >
                  <div className="w-full flex-auto">
                    <p>Title: {nft.title}</p>
                    <p>Token Id: {hexToNumber(nft.id.tokenId)}</p>
                  </div>
                  <button
                    className="mt-2 sm:mt-0 w-full sm:w-20 p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
                    onClick={() =>
                      setNftToList({
                        title: nft.title,
                        address: contracts[account.chain.id].nft.address,
                        tokenId: hexToNumber(nft.id.tokenId).toString(),
                      })
                    }
                  >
                    List
                  </button>
                </div>
              ))}
            </div>
          )}
          {!fetching0F && fetched0F && all0FNfts.length == 0 && (
            <p className="text-rose-500">You have no 0F Nfts :"{"("}</p>
          )}
        </div>
        <div className="p-4 border border-black rounded-2xl flex flex-col justify-center items-center">
          {!fetchingAll && (
            <button
              className="p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
              onClick={() => fetchNFTs([])}
            >
              Fetch My All NFTs
            </button>
          )}
          {fetchingAll && <p>Please wait...</p>}
          {!fetchingAll && fetchedAll && allNfts.length > 0 && (
            <div className="w-full">
              {allNfts.map((nft, i) => (
                <div
                  key={`nft-${i}`}
                  className="flex flex-col sm:flex-row my-2 border border-black p-2 rounded-2xl items-center justify-center"
                >
                  <div className="w-full flex-auto">
                    <p>Title: {nft.title}</p>
                    <p>Token Id: {hexToNumber(nft.id.tokenId)}</p>
                  </div>
                  <button
                    className="mt-2 sm:mt-0 w-full sm:w-20 p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
                    onClick={() =>
                      setNftToList({
                        title: nft.title,
                        address: nft.contract.address,
                        tokenId: hexToNumber(nft.id.tokenId).toString(),
                      })
                    }
                  >
                    List
                  </button>
                </div>
              ))}
            </div>
          )}
          {!fetchingAll && fetchedAll && allNfts.length == 0 && (
            <p className="text-rose-500">You have no NFT at all:"{"("}</p>
          )}
        </div>
      </div>
      {showModal && (
        <ListingModal
          nftToList={nftToList}
          onClose={closeModal}
          chain={account.chain}
        />
      )}
    </>
  );
}

// Getting NFT collection details
//   const fetchNFTsForCollection = async (collection) => {
//     setFetching0F(true);
//     if (collection.length) {
//       var requestOptions = {
//         method: "GET",
//       };
//       const api_key = "XQYE9fHdpqu1yveYkQQwqM5lVYTk477V";
//       const baseURL = `https://eth-sepolia.g.alchemy.com/v2/${api_key}/getNFTsForCollection/`;
//       const fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}`;
//       const nfts = await fetch(fetchURL, requestOptions).then((data) =>
//         data.json()
//       );
//       if (nfts) {
//         console.log("NFTs in collection:", nfts);
//         setAll0FNfts(nfts.nfts);
//       }
//     }

//     setFetching0F(false);
//   };
