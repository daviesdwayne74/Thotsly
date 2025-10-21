import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { idVerifications, ageVerifications } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const verificationRouter = router({
  // Submit government ID for verification
  submitId: protectedProcedure
    .input(z.object({
      idType: z.enum(["passport", "driver_license", "national_id", "other"]),
      idNumber: z.string(),
      fullName: z.string(),
      dateOfBirth: z.string(), // YYYY-MM-DD
      expiryDate: z.string().optional(),
      country: z.string(), // ISO country code
      idImageUrl: z.string(),
      idImageBackUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const verificationId = uuid();

      // Calculate age
      const birthDate = new Date(input.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const isOver18 = age >= 18;
      const isOver21 = age >= 21;

      // Store ID verification
      await db.insert(idVerifications).values({
        id: verificationId,
        userId: ctx.user.id,
        idType: input.idType,
        idNumber: input.idNumber, // In production, encrypt this
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        expiryDate: input.expiryDate,
        country: input.country,
        idImageUrl: input.idImageUrl,
        idImageBackUrl: input.idImageBackUrl,
      });

      // Store age verification
      const ageVerificationId = uuid();
      await db.insert(ageVerifications).values({
        id: ageVerificationId,
        userId: ctx.user.id,
        verificationId,
        dateOfBirth: input.dateOfBirth,
        age,
        isOver18,
        isOver21,
      });

      return {
        verificationId,
        age,
        isOver18,
        isOver21,
        status: "pending",
      };
    }),

  // Get verification status
  getVerificationStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const verification = await db
        .select()
        .from(idVerifications)
        .where(eq(idVerifications.userId, ctx.user.id))
        .orderBy(desc(idVerifications.submittedAt))
        .limit(1);

      if (!verification.length) return null;

      const ageVerification = await db
        .select()
        .from(ageVerifications)
        .where(eq(ageVerifications.verificationId, verification[0].id))
        .limit(1);

      return {
        status: verification[0].status,
        submittedAt: verification[0].submittedAt,
        verifiedAt: verification[0].verifiedAt,
        age: ageVerification[0]?.age,
        isOver18: ageVerification[0]?.isOver18,
        isOver21: ageVerification[0]?.isOver21,
        rejectionReason: verification[0].verificationNotes,
      };
    }),

  // Get pending verifications (admin)
  getPendingVerifications: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      if (ctx.user.role !== "admin") return [];

      return await db
        .select()
        .from(idVerifications)
        .where(eq(idVerifications.status, "pending"))
        .orderBy(desc(idVerifications.submittedAt))
        .limit(50);
    }),

  // Review ID verification (admin)
  reviewVerification: protectedProcedure
    .input(z.object({
      verificationId: z.string(),
      approved: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (ctx.user.role !== "admin") throw new Error("Unauthorized");

      await db
        .update(idVerifications)
        .set({
          status: input.approved ? "verified" : "rejected",
          verificationNotes: input.notes,
          verifiedBy: ctx.user.id,
          verifiedAt: new Date(),
        })
        .where(eq(idVerifications.id, input.verificationId));

      return { success: true };
    }),

  // Get verification details (admin)
  getVerificationDetails: protectedProcedure
    .input(z.object({ verificationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      if (ctx.user.role !== "admin") return null;

      const verification = await db
        .select()
        .from(idVerifications)
        .where(eq(idVerifications.id, input.verificationId))
        .limit(1);

      if (!verification.length) return null;

      const ageVerification = await db
        .select()
        .from(ageVerifications)
        .where(eq(ageVerifications.verificationId, verification[0].id))
        .limit(1);

      return {
        ...verification[0],
        age: ageVerification[0]?.age,
        isOver18: ageVerification[0]?.isOver18,
        isOver21: ageVerification[0]?.isOver21,
      };
    }),
});

