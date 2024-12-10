import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { TESTNET, networkType } from "../../config/config";
import Order from "../../model/OrderModel";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { getInscriptionInfo } from "../../utils/unisat.api";
import { IOrderData } from "../../utils/types";
import { ACTIVE } from "../../config/config";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const UpdateListingRouter = Router();

// @route    POST api/relist
// @desc     Get psbt for updating Order
// @access   Private

UpdateListingRouter.post(
  "/relist",
  check("sellerOrdinalId", "SellerOrdinals is required").notEmpty(),
  check("sellerOrdinalPrice", "SellerOrdinalPrice is required").notEmpty(),
  check("sellerPaymentAddress", "SellerPaymentAddresss is required").notEmpty(),
  check(
    "sellerOrdinalPublicKey",
    "SellerOrdinalPublicKey is required"
  ).notEmpty(),

  async (req: Request, res: Response) => {
    try {
      // Validate Form Inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors.array() });
      }
      // Getting parameter from request
      const {
        sellerOrdinalId,
        sellerOrdinalPrice,
        sellerPaymentAddress,
        sellerOrdinalPublicKey,
      } = req.body;

      // Check if this ordinalId exists on database.
      const ordinalExists = await Order.findOne({ ordinalId: sellerOrdinalId });
      if (!ordinalExists) {
        return res.status(500).json({ error: "This Ordinal is not exist." });
      }

      // network Instance based on networkType
      const network: Bitcoin.Network =
        networkType == TESTNET
          ? Bitcoin.networks.testnet
          : Bitcoin.networks.bitcoin;

      // Create new Psbt for seller Psbt to be signed
      const psbt = new Bitcoin.Psbt({ network });

      // Get Inscription UTXO info from inscription id
      const ordinalUTXO = await getInscriptionInfo(
        sellerOrdinalId,
        networkType ?? ""
      );

      // Get output buffer from publicKey
      const { output } = Bitcoin.payments.p2tr({
        internalPubkey: Buffer.from(sellerOrdinalPublicKey, "hex").subarray(
          1,
          33
        ),
        network: network,
      });

      // Addinput inscription UTXO to Psbt
      psbt.addInput({
        hash: ordinalUTXO.txid,
        index: ordinalUTXO.vout,
        witnessUtxo: {
          value: ordinalUTXO.value,
          script: output ?? Buffer.alloc(0),
        },
        tapInternalKey: Buffer.from(sellerOrdinalPublicKey, "hex").subarray(
          1,
          33
        ),
      });

      // Add output for getting price of inscription
      psbt.addOutput({
        address: sellerPaymentAddress,
        value: +sellerOrdinalPrice,
      });

      return res.status(200).send({ data: psbt.toHex() });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);


UpdateListingRouter.post(
  "/confirm-relist",
  check("sellerOrdinalId", "SellerOrdinals is required").notEmpty(),
  check("sellerOrdinalPrice", "SellerOrdinalPrice is required").notEmpty(),
  check("sellerPaymentAddress", "SellerPaymentAddresss is required").notEmpty(),
  check(
    "sellerOrdinalPublicKey",
    "SellerOrdinalPublicKey is required"
  ).notEmpty(),
  check("signedListingPSBT", "SignedListingPSBT is required").notEmpty(),

  async (req: Request, res: Response) => {
    try {
      // Validate Form Inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors.array() });
      }
      // Getting parameter from request
      const {
        sellerOrdinalId,
        sellerOrdinalPrice,
        sellerPaymentAddress,
        sellerOrdinalPublicKey,
        signedListingPSBT,
      } = req.body;

      // Check if this ordinalId exists on database.
      const ordinalExists = await Order.findOne({ ordinalId: sellerOrdinalId });
      if (!ordinalExists) {
        return res.status(400).json({ error: "This Ordinal is not exist." });
      }

      // Check the request value is valid comparing with existing database data
      if (
        ordinalExists.sellerPaymentAddress == sellerPaymentAddress &&
        ordinalExists.sellerOrdinalPublicKey == sellerOrdinalPublicKey
      ) {
        // Get Inscription UTXO info from inscription id
        const ordinalUTXO = await getInscriptionInfo(
          sellerOrdinalId,
          networkType ?? ""
        );

        // Create new instance to save new Order
        const updateOrderData: IOrderData = {
          ordinalId: sellerOrdinalId,
          price: +sellerOrdinalPrice,
          sellerPaymentAddress: sellerPaymentAddress,
          sellerOrdinalPublicKey: sellerOrdinalPublicKey,
          status: ACTIVE,
          ordinalUtxoTxId: ordinalUTXO.txid,
          ordinalUtxoVout: ordinalUTXO.vout,
          serviceFee: +sellerOrdinalPrice / 100,
          signedListingPSBT: signedListingPSBT,
        };

        // Update with new Order Data
        const updatedOrder = await Order.findOneAndUpdate(
          { ordinalId: sellerOrdinalId },
          updateOrderData,
          { new: true }
        );

        return res.status(200).send({ data: updatedOrder });
      } else {
        return res.status(500).send({
          error: "Request Data is not match with existing database data.",
        });
      }
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error });
    }
  }
);

export default UpdateListingRouter;
