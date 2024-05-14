import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import EneftyABI from "../../src/contracts/Enefty.json";
import { contracts } from "../contracts/contracts";

export default function Mint() {
  const account = useAccount();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  async function submit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = formData.get("amount");

    writeContract({
      address: contracts[account.chain.id].nft.address,
      abi: EneftyABI,
      functionName: "claim",
      args: [BigInt(amount)],
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return (
    <div className="p-4">
      <form
        onSubmit={submit}
        className="flex flex-col gap-4 p-4 border border-black rounded-2xl"
      >
        <div>
          <input
            className="w-full p-2 border border-black rounded-2xl h-12 leading-tight"
            name="amount"
            placeholder="Please choose between 1 to 100"
            required
            type="number"
            min={1}
            max={100}
          />
          <p className="mt-1 text-xs">max mint per tx: 100</p>
        </div>
        <button
          disabled={isPending}
          className={`border p-2 rounded-2xl ${
            isPending
              ? "border-gray-700 bg-gray-300 text-gray-500"
              : "border-black bg-black text-white hover:bg-white hover:text-black transition duration-300"
          }`}
          type="submit"
        >
          {isPending ? "Wait for tx..." : "Mint"}
        </button>
        {hash && (
          <p className="mt-2 text-xs text-blue-500">Transaction Hash: {hash}</p>
        )}
        {isConfirming && (
          <p className="mt-2 text-xs text-blue-500">
            Waiting for confirmation...
          </p>
        )}
        {isConfirmed && (
          <p className="mt-2 text-xs text-emerald-500">Successfully Minted!</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-rose-500">
            Error: {error.shortMessage || error.message}
          </p>
        )}
      </form>
    </div>
  );
}
