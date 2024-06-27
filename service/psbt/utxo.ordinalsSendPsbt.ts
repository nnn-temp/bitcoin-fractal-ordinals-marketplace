import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { TESTNET } from "../../config/config";
import { getInscriptionInfo } from "../../utils/unisat.api";
import wallet from "../wallet/initializeWallet";
import { IUtxo } from "../../utils/types";
Bitcoin.initEccLib(ecc);

export const RedeemOrdinalsUtxoSendPsbt = async (
  selectedUtxos: Array<IUtxo>,
  networkType: string,
  createOfferData: any,
  redeemFee: number
): Promise<Bitcoin.Psbt> => {
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  let inputUtxoSumValue: number = selectedUtxos.reduce(
    (accumulator: number, currentValue: IUtxo) =>
      accumulator + currentValue.value,
    0
  );

  let inscriptionUTXO: IUtxo = await getInscriptionInfo(
    createOfferData.ordinalId,
    networkType
  );

  psbt.addInput({
    hash: inscriptionUTXO.txid,
    index: inscriptionUTXO.vout,
    witnessUtxo: {
      value: inscriptionUTXO.value,
      script: wallet.output,
    },
    tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
  });

  selectedUtxos.forEach((utxo) => {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
        script: wallet.output,
      },
      tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
  });

  psbt.addOutput({
    address: wallet.address,
    value: inscriptionUTXO.value,
  });

  psbt.addOutput({
    address: wallet.address,
    value: createOfferData.price,
  });

  psbt.addOutput({
    address: wallet.address,
    value: createOfferData.serviceFee,
  });

  psbt.addOutput({
    address: wallet.address,
    value:
      inputUtxoSumValue -
      redeemFee -
      createOfferData.serviceFee -
      createOfferData.price,
  });

  return psbt;
};

export const OrdinalsUtxoSendPsbt = async (
  selectedUtxos: Array<IUtxo>,
  networkType: string,
  createOfferData: any,
  redeemFee: number
): Promise<Bitcoin.Psbt> => {
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  const network: Bitcoin.Network =
    networkType == TESTNET
      ? Bitcoin.networks.testnet
      : Bitcoin.networks.bitcoin;

  let inputUtxoSumValue: number = selectedUtxos.reduce(
    (accumulator: number, currentValue: IUtxo) =>
      accumulator + currentValue.value,
    0
  );

  let inscriptionUTXO = await getInscriptionInfo(
    createOfferData.ordinalId,
    networkType
  );

  psbt.addInput({
    hash: inscriptionUTXO.txid,
    index: inscriptionUTXO.vout,
    witnessUtxo: {
      value: inscriptionUTXO.value,
      script: Bitcoin.address.toOutputScript(
        inscriptionUTXO.address as string,
        network
      ),
    },
    tapInternalKey: Buffer.from(createOfferData.sellerOrdinalPublicKey, "hex"),
  });

  selectedUtxos.forEach((utxo) => {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
        script: Bitcoin.address.toOutputScript(
          createOfferData.buyerPaymentAddress as string,
          network
        ),
      },
      tapInternalKey: Buffer.from(createOfferData.buyerPaymentPublicKey, "hex"),
    });
  });

  psbt.addOutput({
    address: createOfferData.buyerPaymentAddress,
    value: inscriptionUTXO.value,
  });

  psbt.addOutput({
    address: createOfferData.sellerPaymentAddress,
    value: createOfferData.price,
  });

  psbt.addOutput({
    address: wallet.address,
    value: createOfferData.serviceFee,
  });

  psbt.addOutput({
    address: createOfferData.buyerPaymentAddress,
    value:
      inputUtxoSumValue -
      redeemFee -
      createOfferData.price -
      createOfferData.serviceFee,
  });

  return psbt;
};
