import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import Order from "../../model/OrderModel";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { HALFHOURFEE, ACTIVE } from "../../config/config";
import { createOfferPsbt } from "../../service/psbt/createOfferPsbt";

Bitcoin.initEccLib(ecc);

//create a new instance of the express router
const CreateOfferRouter = Router();

// @route    POST api/create-offer
// @desc     Create Psbt for buying ordinal
// @access   Private

CreateOfferRouter.post(
  "/create-offer",
  check("ordinalId", "OrdinalId is required").notEmpty(),
  check("buyerPaymentAddress", "BuyerPaymentAddress is required").notEmpty(),
  check("buyerOrdinalAddress", "BuyerOrdinalAddress is required").notEmpty(),
  check(
    "buyerPaymentPublicKey",
    "BuyerPaymentPublicKey is required"
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
        ordinalId,
        buyerPaymentAddress,
        buyerOrdinalAddress,
        buyerPaymentPublicKey,
      } = req.body;

      // Get feeRateTier from request data
      const feeRateTier: string = req.body.feeRateTier ?? HALFHOURFEE;

      // Check if this ordinalId exists on database.
      const ordinalData = await Order.findOne({ ordinalId: ordinalId });
      if (!ordinalData) {
        return res.status(500).json({ error: "This Ordinal is not exist." });
      }
      if (ordinalData.status != ACTIVE) {
        return res
          .status(500)
          .json({ error: "This ordinal is already sold or pending status." });
      }

      // Integrate all necessary data
      const createOfferData = {
        ...ordinalData.toJSON(),
        buyerPaymentAddress,
        buyerOrdinalAddress,
        buyerPaymentPublicKey,
        feeRateTier,
      };

      // Create Psbt for create buyer offer
      const response = await createOfferPsbt(createOfferData);

      // Send Psbt to frontend
      if (response.isSuccess) {
        return res.status(200).json({ data: response.data });
      } else {
        return res
          .status(500)
          .json({ error: "Failed real buyer psbt creating." });
      }
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error });
    }
  }
);

export default CreateOfferRouter;
