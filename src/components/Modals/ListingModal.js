import { useState, useEffect } from "react";
import { contracts } from "../../contracts/contracts";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEther } from "viem";
import MarketplaceABI from "../../contracts/Marketplace.json";
import ApprovalABIfrom from "../../contracts/IERC721Approval.json";

export default function ListingModal({ nftToList, chain, onClose }) {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const [approved, setApproved] = useState(false);
  const onSuccess = () => setApproved(true);

  async function submit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const price = formData.get("price");

    writeContract({
      address: contracts[chain.id].marketplace.address,
      abi: MarketplaceABI,
      functionName: "listItem",
      args: [nftToList.address, BigInt(nftToList.tokenId), parseEther(price)],
    });
  }

  const {
    data: approvedAddress,
    isPending: isApprovedBeforePending,
    isLoading: isApprovedBeforeLoading,
    isFetching: isApprovedBeforeFetching,
    isError,
    // isSuccess,
  } = useReadContract({
    address: contracts[chain.id].nft.address,
    abi: ApprovalABIfrom,
    functionName: "getApproved",
    args: [nftToList.tokenId],
  });

  useEffect(() => {
    if (!approvedAddress) return;
    if (
      approvedAddress.toLowerCase() ===
      contracts[chain.id].marketplace.address.toLowerCase()
    ) {
      setApproved(true);
    }
  }, [approvedAddress]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return (
    <div className="fixed top-0 w-full h-full flex justify-center items-center bg-black/40">
      <div className="bg-white justify-center items-center flex basis-11/12 md:basis-3/4 lg:basis-1/2 p-1 rounded-2xl">
        <div className="w-full">
          <div className="relative mb-2">
            <button
              className="absolute right-2 text-md hover:text-gray-500"
              onClick={onClose}
            >
              x
            </button>
          </div>
          <div className="p-4">
            <h1 className="font-bold my-4 border-b border-black">
              Listing <span className="text-blue-500">{nftToList.title}</span>
            </h1>
            {(isApprovedBeforePending ||
              isApprovedBeforeFetching ||
              isApprovedBeforeLoading) && (
              <p className="my-6 text-center">Loading...</p>
            )}

            {!isApprovedBeforeFetching &&
              !isApprovedBeforeLoading &&
              !isApprovedBeforePending &&
              !isConfirmed &&
              approvedAddress &&
              approvedAddress.toLowerCase() !==
                contracts[chain.id].marketplace.address.toLowerCase() && (
                <ApprovingModal
                  nftToList={nftToList}
                  chain={chain}
                  onSuccess={onSuccess}
                />
              )}

            {isError && (
              <p className="my-6 text-center text-rose-500">
                Error occuredd :"{"("}
              </p>
            )}
            {approved && (
              <form className="mt-6" onSubmit={submit}>
                <label>Price ({chain.nativeCurrency.symbol})</label>
                <input
                  name="price"
                  className="mt-1 w-full leading-tight p-3 border border-b rounded-2xl"
                  required
                  type="number"
                  min={0.000001}
                  step={0.000001}
                  placeholder="0.01"
                />

                <button
                  className="w-full mt-4 p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300 disabled:border-gray-700 disabled:text-gray-500 disabled:bg-gray-300"
                  type="submit"
                  disabled={
                    isPending || isConfirmed || isConfirming || !approved
                  }
                >
                  {isPending || isConfirming ? "Listing..." : "List"}
                </button>
                {hash && (
                  <p className="mt-2 text-xs text-blue-500 break-all">
                    Tx hash: {hash}
                  </p>
                )}

                {isConfirming && (
                  <p className="text-xs text-blue-500">Wait for listing...</p>
                )}
                {isConfirmed && (
                  <p className="text-xs text-emerald-500">
                    Successfully listed!
                  </p>
                )}
                {error && (
                  <p className="mt-2 text-xs text-rose-500">
                    Error: {error.shortMessage || error.message}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovingModal({ nftToList, chain, onSuccess }) {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  async function approve() {
    writeContract({
      address: contracts[chain.id].nft.address,
      abi: ApprovalABIfrom,
      functionName: "approve",
      args: [
        contracts[chain.id].marketplace.address,
        BigInt(nftToList.tokenId),
      ],
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (!isConfirmed) return;
    onSuccess();
  }, [isConfirmed]);
  return (
    <>
      <button
        className="w-full mt-4 p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300 disabled:border-gray-700 disabled:text-gray-500 disabled:bg-gray-300 disbaled:border-gray-800"
        type="button"
        disabled={isPending || isConfirming || isConfirmed}
        onClick={() => approve()}
      >
        {isPending || isConfirming
          ? "Approving..."
          : isConfirmed
          ? "Approved"
          : "Approve"}
      </button>
      {hash && (
        <p className="mt-2 text-xs text-blue-500 break-all">Tx Hash: {hash}</p>
      )}
      {isConfirming && (
        <p className="text-xs text-blue-500">Waiting for approving...</p>
      )}
      {isConfirmed && (
        <p className="text-xs text-emerald-500">Successfully approved!</p>
      )}
      {error && (
        <p className="text-xs text-rose-500">
          Error: {error.shortMessage || error.message}
        </p>
      )}
    </>
  );
}
