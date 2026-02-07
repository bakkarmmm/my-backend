    import mongoose from "mongoose";
    const PaymantsSchema = new mongoose.Schema(
    {
        bussninsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bussnise",
        
        },
        subsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        
        index:true,
        },
        receiptImage: {
        type: String,
        required: true,
        },
        status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
        index: true,
        },
        type:{
            type: String,
            enum:["NEW","RENEW"],
            default:"NEW"
        }
    }, 
    { timestamps: true },
    );
    PaymantsSchema.index(
    { subsId: 1, status: 1 },
    { partialFilterExpression: { status: "PENDING" } },
    );
    export default mongoose.model("paymant", PaymantsSchema);
