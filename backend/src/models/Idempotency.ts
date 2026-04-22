import { Schema, model, Document } from 'mongoose';

export interface IIdempotency extends Document {
  key: string;
  requestHash: string;
  statusCode: number;
  response: Record<string, unknown>;
  createdAt: Date;
}

const idempotencySchema = new Schema<IIdempotency>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestHash: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

// Auto-expire idempotency records after 24 hours
idempotencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Idempotency = model<IIdempotency>('Idempotency', idempotencySchema);
