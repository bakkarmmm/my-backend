import cron from "node-cron";
import Subscription from "../modelus/Subscription.js";

export const expireSubscriptionsJob = () => {

  cron.schedule("0 0 * * *", async () => {
    console.log("Running subscription expiration job...");

    await Subscription.updateMany(
      { endDate: { $lt: new Date() }, status: "active" },
      { status: "expired" }
    );

    console.log("Expired subscriptions updated.");
  });

};