import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import MarketplaceABI from "../../src/contracts/Marketplace.json";
import { contracts } from "../contracts/contracts";
import { formatEther } from "viem";
import BuyingModal from "./Modals/BuyingModal";
import UpdateModal from "./Modals/UpdateModal";
import CancelModal from "./Modals/CancelModal";

export default function AllNfts() {
  const [show, setShow] = useState(false);
  const account = useAccount();

  useEffect(() => setShow(false), [account.chainId, account.address]);
  return (
    <div className="w-full p-4 border border-black rounded-2xl flex flex-col justify-center items-center">
      {!show && (
        <button
          className="p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
          onClick={() => setShow(true)}
        >
          Show All listed Nfts
        </button>
      )}
      {show && <GetAllListedNfts />}
    </div>
  );
}

function GetAllListedNfts() {
  const { chain, address } = useAccount();

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [nftToBuy, setNftToBuy] = useState(null);
  const [nftToCancel, setNftToCancel] = useState(null);
  const [nftToUpdate, setNftToUpdate] = useState(null);
  const [myNfts, setMyNfts] = useState([]);

  useEffect(() => {
    if (!nftToUpdate) return;
    setShowUpdateModal(true);
  }, [nftToUpdate]);

  useEffect(() => {
    if (!nftToCancel) return;
    setShowCancelModal(true);
  }, [nftToCancel]);

  useEffect(() => {
    if (!nftToBuy) return;
    setShowBuyModal(true);
  }, [nftToBuy]);

  const {
    data: allListedNfts,
    isPending,
    isLoading,
    isFetching,
    isError,
    isSuccess,
  } = useReadContract({
    address: contracts[chain.id].marketplace.address,
    abi: MarketplaceABI,
    functionName: "getAllListedNfts",
  });

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setNftToBuy(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setNftToUpdate(null);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setNftToCancel(null);
  };

  useEffect(() => {
    if (!isSuccess) return;
    if (allListedNfts.length === 0) return;

    const _myNfts = allListedNfts.filter(
      (nft) => nft.seller.toLowerCase() === address.toLowerCase()
    );
    setMyNfts(_myNfts);
  }, [isSuccess]);

  if (isError)
    return (
      <div className="flex w-full justify-center items-center">
        <p className="text-rose-500">Error occured :"{"("}</p>
      </div>
    );

  if (isPending || isLoading || isFetching)
    return (
      <div className="flex w-full justify-center items-center">
        <p>Please wait...</p>
      </div>
    );

  return (
    <>
      {showBuyModal && nftToBuy && (
        <BuyingModal
          nftToBuy={nftToBuy}
          chain={chain}
          onClose={handleCloseBuyModal}
        />
      )}
      {showUpdateModal && nftToUpdate && (
        <UpdateModal
          nftToUpdate={nftToUpdate}
          chain={chain}
          onClose={handleCloseUpdateModal}
        />
      )}
      {showCancelModal && nftToCancel && (
        <CancelModal
          nftToCancel={nftToCancel}
          chain={chain}
          onClose={handleCloseCancelModal}
        />
      )}
      {allListedNfts?.length == 0 && (
        <div className="w-full text-center">
          <p className="text-center">Nothing to buy :{"("}</p>
        </div>
      )}
      <div className="w-full">
        <div className="w-full mb-12">
          {myNfts.length > 0 && (
            <h1 className="font-bold mb-4">Listed by you:</h1>
          )}
          {myNfts.map((nft, i) => (
            <div
              key={`my-nft-${i}`}
              className="p-2 my-2 flex flex-col sm:flex-row w-full border border-black rounded-2xl"
            >
              <div className="flex-auto">
                <p>Token Id: {parseInt(nft.tokenId)}</p>
                <p className="flex-auto">
                  Price: {formatEther(nft.price)} {chain.nativeCurrency.symbol}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex gap-2 justify-center items-xenter">
                <button
                  onClick={() => setNftToCancel(nft)}
                  className="w-full sm:w-20 p-2 border border-black rounded-2xl bg-black hover:bg-white text-white hover:text-black transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setNftToUpdate(nft)}
                  className="w-full sm:w-20 p-2 border border-black rounded-2xl bg-black hover:bg-white text-white hover:text-black transition duration-300"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full">
          {allListedNfts?.length > 0 && (
            <>
              <h1 className="font-bold mb-4">All Listed Nfts</h1>
              {allListedNfts?.map((nft, i) => (
                <div
                  key={`all-nft-${i}`}
                  className="p-2 my-2 flex flex-col sm:flex-row w-full border border-black rounded-2xl"
                >
                  <div className="flex-auto">
                    <p>Token Id: {parseInt(nft.tokenId)}</p>
                    <p>
                      Price: {formatEther(nft.price)}{" "}
                      {chain.nativeCurrency.symbol}
                    </p>
                    <p className="break-all">
                      Seller: <span className="text-xs">{nft.seller}</span>{" "}
                    </p>

                    {nft.seller.toLowerCase() === address.toLowerCase() && (
                      <p className="text-blue-500">{"(Listed by YOU)"}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setNftToBuy(nft)}
                    className="mt-2 sm:mt-0 h-12 p-2 w-full sm:w-20 border border-black rounded-2xl text-white bg-black hover:bg-white hover:text-black transition duration-300"
                  >
                    Buy
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
