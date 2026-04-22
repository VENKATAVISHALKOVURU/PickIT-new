import { Router, type IRouter } from "express";
import { db, shopsTable, pricingConfigTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMyShopPricingBody, UpdateMyShopSettingsBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/shop/my", requireAuth, requireRole("owner"), async (req, res): Promise<void> => {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, req.user!.userId));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  res.json({
    id: shop.id,
    ownerId: shop.ownerId,
    name: shop.name,
    shopCode: shop.shopCode,
    address: shop.address ?? null,
    isOpen: shop.isOpen,
  });
});

router.get("/shop/my/pricing", requireAuth, requireRole("owner"), async (req, res): Promise<void> => {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, req.user!.userId));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  const [pricing] = await db.select().from(pricingConfigTable).where(eq(pricingConfigTable.shopId, shop.id));
  if (!pricing) {
    res.status(404).json({ error: "Pricing config not found" });
    return;
  }

  res.json({
    id: pricing.id,
    shopId: pricing.shopId,
    bwPerPage: pricing.bwPerPage,
    colorPerPage: pricing.colorPerPage,
    minimumOrder: pricing.minimumOrder,
  });
});

router.put("/shop/my/pricing", requireAuth, requireRole("owner"), async (req, res): Promise<void> => {
  const parsed = UpdateMyShopPricingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, req.user!.userId));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  const [pricing] = await db
    .update(pricingConfigTable)
    .set({
      bwPerPage: parsed.data.bwPerPage,
      colorPerPage: parsed.data.colorPerPage,
      minimumOrder: parsed.data.minimumOrder,
    })
    .where(eq(pricingConfigTable.shopId, shop.id))
    .returning();

  res.json({
    id: pricing.id,
    shopId: pricing.shopId,
    bwPerPage: pricing.bwPerPage,
    colorPerPage: pricing.colorPerPage,
    minimumOrder: pricing.minimumOrder,
  });
});

router.put("/shop/my/settings", requireAuth, requireRole("owner"), async (req, res): Promise<void> => {
  const parsed = UpdateMyShopSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, req.user!.userId));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  const updateData: Partial<typeof shopsTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.address !== undefined) updateData.address = parsed.data.address;
  if (parsed.data.isOpen !== undefined) updateData.isOpen = parsed.data.isOpen;

  const [updated] = await db
    .update(shopsTable)
    .set(updateData)
    .where(eq(shopsTable.id, shop.id))
    .returning();

  res.json({
    id: updated.id,
    ownerId: updated.ownerId,
    name: updated.name,
    shopCode: updated.shopCode,
    address: updated.address ?? null,
    isOpen: updated.isOpen,
  });
});

router.get("/shop/pricing/:shopId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.shopId) ? req.params.shopId[0] : req.params.shopId;
  const shopId = parseInt(raw, 10);
  if (isNaN(shopId)) {
    res.status(400).json({ error: "Invalid shopId" });
    return;
  }

  const [pricing] = await db.select().from(pricingConfigTable).where(eq(pricingConfigTable.shopId, shopId));
  if (!pricing) {
    res.json({ id: 0, shopId, bwPerPage: 2, colorPerPage: 5, minimumOrder: 10 });
    return;
  }

  res.json({
    id: pricing.id,
    shopId: pricing.shopId,
    bwPerPage: pricing.bwPerPage,
    colorPerPage: pricing.colorPerPage,
    minimumOrder: pricing.minimumOrder,
  });
});

router.post("/shop/join/:shopCode", requireAuth, async (req, res): Promise<void> => {
  const shopCode = Array.isArray(req.params.shopCode) ? req.params.shopCode[0] : req.params.shopCode;

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.shopCode, shopCode));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  await db
    .update(usersTable)
    .set({ shopId: shop.id })
    .where(eq(usersTable.id, req.user!.userId));

  res.json({
    id: shop.id,
    ownerId: shop.ownerId,
    name: shop.name,
    shopCode: shop.shopCode,
    address: shop.address ?? null,
    isOpen: shop.isOpen,
  });
});

router.get("/shop/info/:shopCode", async (req, res): Promise<void> => {
  const shopCode = Array.isArray(req.params.shopCode) ? req.params.shopCode[0] : req.params.shopCode;

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.shopCode, shopCode));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  res.json({
    id: shop.id,
    ownerId: shop.ownerId,
    name: shop.name,
    shopCode: shop.shopCode,
    address: shop.address ?? null,
    isOpen: shop.isOpen,
  });
});

export default router;
