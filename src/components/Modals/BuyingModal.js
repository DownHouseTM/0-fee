import { contracts } from "../../contracts/contracts";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import MarketplaceABI from "../../contracts/Marketplace.json";

export default function BuyingModal({ nftToBuy, chain, onClose }) {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  async function submit(e) {
    e.preventDefault();

    writeContract({
      address: contracts[chain.id].marketplace.address,
      abi: MarketplaceABI,
      functionName: "buyItem",
      args: [BigInt(nftToBuy.id)],
      value: nftToBuy.price,
    });
  }

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
            <h1 className="font-bold my-3">
              Buying{" "}
              <span className="text-blue-500">
                NFT tokenId: {parseInt(nftToBuy.tokenId)}
              </span>
            </h1>
            <p>
              Price {formatEther(nftToBuy.price)} {chain.nativeCurrency.symbol}
            </p>
            <form className="p-3" onSubmit={submit}>
              <button
                className="w-full mt-4 p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300 disabled:border-gray-700 disabled:text-gray-500 disabled:bg-gray-300"
                type="submit"
                disabled={isPending || isConfirmed || isConfirming}
              >
                {isPending || isConfirming ? "Purchasing..." : "Buy"}
              </button>
              {hash && <p className="mt-2 text-xs text-blue-500">Tx hash: {hash}</p>}

              {isConfirming && (
                <p className="text-xs text-blue-500">Wait for confirming...</p>
              )}
              {isConfirmed && (
                <p className="text-xs text-emerald-500">
                  Successfully Purchased!
                </p>
              )}
              {error && (
                <p className="mt-2 text-xs text-rose-500">
                  Error: {error.shortMessage || error.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
