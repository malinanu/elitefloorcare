/**
 * pnpm seed — (re)load the launch content into the CMS.
 * Safe to re-run: services are upserted by slug; projects/testimonials/plans are only added when empty;
 * globals are overwritten with the launch copy (so don't run this on a live site you've edited).
 */
import config from "@payload-config";
import { getPayload } from "payload";
import { seed } from "../cms/seed";

const payload = await getPayload({ config });
await seed(payload);
process.exit(0);
