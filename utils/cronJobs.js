import cron from "node-cron";
import Subscription from "../modelus/Subscription.js";
import Bussnise from "../modelus/Busninss.js";
import Notification from "../modelus/Notification.js";

// انتهاء الاشتراكات الساعة 12
export const expireSubscriptionsJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running subscription expiration job...");

    const now = new Date();

    const expiredSubs = await Subscription.find({
      endDate: { $lt: now },
      status: { $in: ["active", "canceled"] },
    });

    for (const sub of expiredSubs) {
      sub.status = "expired";
      await sub.save();

      await Bussnise.findByIdAndUpdate(sub.busId, {
        status: "CLOSED",
      });
    }

    console.log(`Expired subscriptions updated: ${expiredSubs.length}`);
  });
};

// تنبيه قبل 3 أيام من انتهاء الاشتراك
export const subscriptionReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    console.log("Running subscription reminder job...");

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const subs = await Subscription.find({
      endDate: {
        $lte: threeDaysLater,
        $gte: new Date(),
      },
      status: "active",
    }).populate("busId");

    for (const sub of subs) {
      console.log(`Subscription for store ${sub.busId.name} will expire soon`);

      await Notification.create({
        userId: sub.busId.bussnisOwner, // صاحب المتجر
        type: "subscription",
        title: "اشتراكك سينتهي قريبًا",
        message: `اشتراك متجرك ${sub.busId.name} سينتهي خلال 3 أيام. يرجى تجديده.`,
        link: "/dashboard/subscription", // رابط لصفحة الاشتراك
      });
    }
  });
};
