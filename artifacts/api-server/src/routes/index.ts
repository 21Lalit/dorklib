import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dorksRouter from "./dorks";
import categoriesRouter from "./categories";
import tagsRouter from "./tags";
import operatorsRouter from "./operators";
import platformsRouter from "./platforms";
import searchRouter from "./search";
import sourcesRouter from "./sources";
import ingestionRouter from "./ingestion";
import analyticsRouter from "./analytics";
import collectionsRouter from "./collections";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dorksRouter);
router.use(categoriesRouter);
router.use(tagsRouter);
router.use(operatorsRouter);
router.use(platformsRouter);
router.use(searchRouter);
router.use(sourcesRouter);
router.use(ingestionRouter);
router.use(analyticsRouter);
router.use(collectionsRouter);
router.use(aiRouter);

export default router;
