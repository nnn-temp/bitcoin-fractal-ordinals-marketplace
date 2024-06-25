import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";

import Order from "../../model/OrderModel";

//create a new instance of the express router
const OrderRouter = Router();

// @route    POST api/create-listing
// @desc     New Order
// @access   Private

OrderRouter.post(
  "/create-listing",
  check("sellerOrdinalId", "SellerOrdinals is required").notEmpty(),
  check("sellerOrdinalPrice", "SellerOrdinalPrice is required").notEmpty(),
  check("sellerPaymentAddress", "SellerPaymentAddresss is required").notEmpty(),
  check(
    "sellerOrdinalPublicKey",
    "SellerOrdinalPublicKey is required"
  ).notEmpty(),

  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const {
        sellerOrdinalId,
        sellerOrdinalPrice,
        sellerPaymentAddress,
        sellerOrdinalPublicKey,
      } = req.body;

      const ordinalExists = await Order.findOne({ ordinalId: sellerOrdinalId });

      if (ordinalExists) {
        return res
          .status(400)
          .json({ error: "This Ordinal is already listed." });
      }
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).send({ error: error });
    }
  }
);

export default OrderRouter;
